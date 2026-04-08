import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { resend, RESEND_FROM } from "@/lib/resend";
import { QuoteRequestReceived } from "@/lib/emails/quote-request-received";
import { QuoteRequestAdminNotification } from "@/lib/emails/quote-request-admin-notification";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, phone, eventDate, eventType, nbPeople, eventLocation, message, selectedDishes } = body;

    // Validation
    if (!name || !email || !phone || !eventDate || !nbPeople) {
      return NextResponse.json(
        { error: "Champs requis manquants (nom, email, téléphone, date, nombre de personnes)" },
        { status: 400 }
      );
    }

    if (!selectedDishes?.length) {
      return NextResponse.json(
        { error: "Sélectionnez au moins un plat" },
        { status: 400 }
      );
    }

    const parsedNbPeople = parseInt(String(nbPeople));
    if (isNaN(parsedNbPeople) || parsedNbPeople < 5 || parsedNbPeople > 50) {
      return NextResponse.json(
        { error: "Le nombre de personnes doit être entre 5 et 50" },
        { status: 400 }
      );
    }

    const parsedDate = new Date(eventDate);
    if (isNaN(parsedDate.getTime()) || parsedDate <= new Date()) {
      return NextResponse.json(
        { error: "La date de l'événement doit être dans le futur" },
        { status: 400 }
      );
    }

    // Re-fetch dishes from DB for security
    const dishIds = selectedDishes.map((d: { dishId: string }) => d.dishId);
    const dbDishes = await prisma.traiteurDish.findMany({
      where: { id: { in: dishIds }, isActive: true },
      include: { formats: true },
    });

    // Build snapshot
    const dishesSnapshot = dbDishes.map((dish) => {
      const matchedFormat = dish.formats.find(
        (f) => parsedNbPeople >= f.minPeople && parsedNbPeople <= f.maxPeople
      );

      return {
        dishId: dish.id,
        dishName: dish.name,
        category: dish.category,
        matchedFormat: matchedFormat
          ? {
              minPeople: matchedFormat.minPeople,
              maxPeople: matchedFormat.maxPeople,
              pricePerPerson: Number(matchedFormat.indicativePricePerPerson),
            }
          : null,
        estimatedTotal: matchedFormat
          ? Number(matchedFormat.indicativePricePerPerson) * parsedNbPeople
          : null,
      };
    });

    // Generate quote number
    const quoteNumber = `DEV-${Date.now().toString(36).toUpperCase()}`;

    // Create quote request
    const quoteRequest = await prisma.quoteRequest.create({
      data: {
        quoteNumber,
        guestName: name,
        guestEmail: email,
        guestPhone: phone,
        eventDate: parsedDate,
        eventType: eventType || null,
        nbPeople: parsedNbPeople,
        eventLocation: eventLocation || null,
        selectedDishes: dishesSnapshot,
        message: message || null,
        status: "new",
      },
    });

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://chezmisou.com";

    // Send admin notification email
    try {
      const adminEmails = (process.env.ADMIN_EMAILS || "")
        .split(",")
        .map((e) => e.trim())
        .filter(Boolean);

      if (adminEmails.length > 0) {
        await resend.emails.send({
          from: RESEND_FROM,
          to: adminEmails,
          subject: `Nouvelle demande de devis traiteur #${quoteNumber}`,
          react: QuoteRequestAdminNotification({
            quoteNumber,
            quoteId: quoteRequest.id,
            customerName: name,
            customerEmail: email,
            customerPhone: phone,
            eventDate: parsedDate.toLocaleDateString("fr-FR", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            }),
            eventType: eventType || null,
            nbPeople: parsedNbPeople,
            eventLocation: eventLocation || null,
            dishes: dishesSnapshot,
            message: message || null,
            appUrl,
          }),
        });
      }
    } catch (emailErr) {
      console.error("Error sending admin notification email:", emailErr);
    }

    // Send confirmation email to client
    try {
      await resend.emails.send({
        from: RESEND_FROM,
        to: email,
        subject: `Votre demande de devis #${quoteNumber} — Chez Misou`,
        react: QuoteRequestReceived({
          customerName: name,
          quoteNumber,
          eventDate: parsedDate.toLocaleDateString("fr-FR", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          }),
          nbPeople: parsedNbPeople,
          dishes: dishesSnapshot.map((d) => ({
            name: d.dishName,
            pricePerPerson: d.matchedFormat?.pricePerPerson ?? null,
          })),
        }),
      });
    } catch (emailErr) {
      console.error("Error sending client confirmation email:", emailErr);
    }

    return NextResponse.json({ success: true, quoteNumber });
  } catch (err) {
    console.error("Error creating quote request:", err);
    return NextResponse.json(
      { error: "Erreur lors de la création de la demande" },
      { status: 500 }
    );
  }
}
