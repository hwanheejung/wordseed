import { Suspense, useState } from "react";
import { RelayEnvironmentProvider } from "react-relay";
import { Button, StyleSheet, Text, View } from "react-native";
import { StatusBar } from "expo-status-bar";

import { DictionaryDetailPage } from "@/routes/DictionaryDetailPage";
import { DictionaryListPage } from "@/routes/DictionaryListPage";
import { AppErrorBoundary } from "@/shared/error-boundary";
import { relayEnvironment } from "@/shared/relay";

export function App() {
  const [selectedEntryId, setSelectedEntryId] = useState<string | null>(null);
  const [retryKey, setRetryKey] = useState(0);

  return (
    <RelayEnvironmentProvider environment={relayEnvironment}>
      <AppErrorBoundary
        key={`${selectedEntryId ?? "list"}-${retryKey}`}
        fallback={({ retry }) => (
          <View style={styles.feedback}>
            <Text style={styles.feedbackText}>
              데이터를 불러오지 못했습니다.
            </Text>
            <Button
              title="다시 시도"
              onPress={() => {
                setRetryKey((currentKey) => currentKey + 1);
                retry();
              }}
            />
          </View>
        )}
      >
        <Suspense
          fallback={
            <View style={styles.feedback}>
              <Text style={styles.feedbackText}>불러오는 중...</Text>
            </View>
          }
        >
          {selectedEntryId === null ? (
            <DictionaryListPage onSelect={setSelectedEntryId} />
          ) : (
            <DictionaryDetailPage
              entryId={selectedEntryId}
              onBack={() => setSelectedEntryId(null)}
              onSelectRecommendation={setSelectedEntryId}
            />
          )}
        </Suspense>
      </AppErrorBoundary>
      <StatusBar style="dark" />
    </RelayEnvironmentProvider>
  );
}

const styles = StyleSheet.create({
  feedback: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    padding: 24,
    backgroundColor: "#ffffff",
  },
  feedbackText: {
    color: "#374151",
    fontSize: 16,
  },
});
