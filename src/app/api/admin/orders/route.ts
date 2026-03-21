import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const ADMIN_PASSWORD = "churchlunch2024";

function checkAuth(request: NextRequest) {
  const password = request.headers.get("x-admin-password");
  return password === ADMIN_PASSWORD;
}

// GET /api/admin/orders — List orders with filters, search, sort, pagination
export async function GET(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type"); // TRAITEUR | EPICERIE_FINE | null (all)
  const status = searchParams.get("status");
  const search = searchParams.get("search");
  const dateFrom = searchParams.get("dateFrom");
  const dateTo = searchParams.get("dateTo");
  const sortBy = searchParams.get("sortBy") || "createdAt";
  const sortOrder = (searchParams.get("sortOrder") || "desc") as "asc" | "desc";
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");

  try {
    // Build where clause
    const where: Record<string, unknown> = {};

    if (type) {
      where.type = type;
    }
    if (status) {
      where.status = status;
    }
    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) (where.createdAt as Record<string, unknown>).gte = new Date(dateFrom);
      if (dateTo) {
        const end = new Date(dateTo);
        end.setHours(23, 59, 59, 999);
        (where.createdAt as Record<string, unknown>).lte = end;
      }
    }
    if (search) {
      where.OR = [
        { guestName: { contains: search, mode: "insensitive" } },
        { guestEmail: { contains: search, mode: "insensitive" } },
        { guestPhone: { contains: search, mode: "insensitive" } },
        { orderNumber: { contains: search, mode: "insensitive" } },
        { user: { name: { contains: search, mode: "insensitive" } } },
        { user: { email: { contains: search, mode: "insensitive" } } },
      ];
    }

    // Valid sort fields
    const validSortFields = ["createdAt", "total", "status", "orderNumber"];
    const orderByField = validSortFields.includes(sortBy) ? sortBy : "createdAt";

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          user: { select: { name: true, email: true, phone: true } },
          items: {
            include: {
              product: { select: { name: true, nameCreole: true, image: true, category: true } },
              size: { select: { label: true } },
            },
          },
          statusHistory: { orderBy: { changedAt: "desc" } },
        },
        orderBy: { [orderByField]: sortOrder },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.order.count({ where }),
    ]);

    // Stats for today
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const todayWhere = {
      ...where,
      createdAt: { gte: todayStart, lte: todayEnd },
    };

    const [todayOrders, pendingCount, todayRevenue, typeBreakdown] =
      await Promise.all([
        prisma.order.count({ where: todayWhere }),
        prisma.order.count({ where: { ...where, status: "PENDING" } }),
        prisma.order.aggregate({
          where: todayWhere,
          _sum: { total: true },
        }),
        prisma.order.groupBy({
          by: ["type"],
          where,
          _count: true,
        }),
      ]);

    return NextResponse.json({
      orders,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      stats: {
        todayOrders,
        pendingCount,
        todayRevenue: todayRevenue._sum.total || 0,
        typeBreakdown: typeBreakdown.reduce(
          (acc, item) => ({ ...acc, [item.type]: item._count }),
          {} as Record<string, number>
        ),
      },
    });
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des commandes" },
      { status: 500 }
    );
  }
}
