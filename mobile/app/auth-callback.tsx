import { Redirect } from "expo-router";

/**
 * Retour de la connexion Google. La session est traitée par l'écran Compte ;
 * si le système ouvre quand même ce lien, on renvoie simplement vers Compte.
 */
export default function AuthCallback() {
  return <Redirect href="/compte" />;
}
