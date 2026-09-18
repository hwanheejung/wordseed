import { Suspense, useState, type ReactNode } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { AppErrorBoundary } from "@/shared/error-boundary";
import { Button, Surface, Text } from "@/shared/ui";

interface QueryBoundaryProps {
  children: (fetchKey: number) => ReactNode;
  active?: boolean;
}

export function QueryBoundary({ children, active = true }: QueryBoundaryProps) {
  const [attempt, setAttempt] = useState(0);

  if (!active) return null;

  return (
    <AppErrorBoundary
      key={attempt}
      fallback={() => (
        <Surface tone="background" style={styles.error}>
          <Text accessibilityRole="alert">Couldn't load this content. Check your connection and try again.</Text>
          <Button label="Try again" onPress={() => setAttempt((value) => value + 1)} />
        </Surface>
      )}
    >
      <Suspense
        fallback={
          <View style={styles.loading}>
            <ActivityIndicator />
            <Text style={styles.loadingText}>Loading…</Text>
          </View>
        }
      >
        {children(attempt)}
      </Suspense>
    </AppErrorBoundary>
  );
}

const styles = StyleSheet.create({
  error: { flex: 1, justifyContent: "center", padding: 24, gap: 16 },
  loading: { flex: 1, justifyContent: "center", gap: 12 },
  loadingText: { textAlign: "center" },
});
