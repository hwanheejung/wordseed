import type { NativeStackNavigationOptions } from "@react-navigation/native-stack";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSession } from "@/entities/session";
import { SignInForm } from "@/features/sign-in";

export const signInPageOptions = {
  headerShown: false,
} satisfies NativeStackNavigationOptions;

export function SignInPage() {
  const session = useSession();
  if (session.status !== "signed-out") return null;

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <SignInForm error={session.error} onSignIn={session.signIn} />
    </SafeAreaView>
  );
}
