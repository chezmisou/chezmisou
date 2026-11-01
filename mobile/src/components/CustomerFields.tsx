import { View } from "react-native";
import { Field } from "./ui";
import { space } from "@/lib/theme";

export interface CustomerForm {
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
}

export function validateCustomer(c: CustomerForm, phoneRequired: boolean): Record<string, string> {
  const errs: Record<string, string> = {};
  if (!c.email.trim()) errs.email = "L'email est requis";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(c.email.trim())) errs.email = "L'email n'est pas valide";
  if (!c.firstName.trim()) errs.firstName = "Le prénom est requis";
  if (!c.lastName.trim()) errs.lastName = "Le nom est requis";
  if (phoneRequired && !c.phone.trim()) errs.phone = "Le téléphone est requis";
  return errs;
}

/** Coordonnées du client, communes aux deux commandes. */
export function CustomerFields({
  value,
  onChange,
  errors,
  phoneRequired,
}: {
  value: CustomerForm;
  onChange: (field: keyof CustomerForm, v: string) => void;
  errors: Record<string, string>;
  phoneRequired: boolean;
}) {
  return (
    <View>
      <Field
        label="Email *"
        value={value.email}
        onChangeText={(t) => onChange("email", t)}
        error={errors.email}
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
        textContentType="emailAddress"
        placeholder="votre@email.com"
      />
      <View style={{ flexDirection: "row", gap: space.md }}>
        <View style={{ flex: 1 }}>
          <Field
            label="Prénom *"
            value={value.firstName}
            onChangeText={(t) => onChange("firstName", t)}
            error={errors.firstName}
            autoComplete="given-name"
            textContentType="givenName"
          />
        </View>
        <View style={{ flex: 1 }}>
          <Field
            label="Nom *"
            value={value.lastName}
            onChangeText={(t) => onChange("lastName", t)}
            error={errors.lastName}
            autoComplete="family-name"
            textContentType="familyName"
          />
        </View>
      </View>
      <Field
        label={phoneRequired ? "Téléphone *" : "Téléphone"}
        value={value.phone}
        onChangeText={(t) => onChange("phone", t)}
        error={errors.phone}
        keyboardType="phone-pad"
        autoComplete="tel"
        textContentType="telephoneNumber"
        placeholder="06 12 34 56 78"
      />
    </View>
  );
}
