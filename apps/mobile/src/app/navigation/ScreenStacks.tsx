import { Suspense, useState, type ReactNode } from "react";
import { useIsFocused } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { ActivityIndicator, View } from "react-native";
import { HomePage } from "@/routes/HomePage";
import { LibraryPage } from "@/routes/LibraryPage";
import { SearchPage } from "@/routes/SearchPage";
import { DictionaryDetailPage } from "@/routes/DictionaryDetailPage";
import { PreviewDetailPage } from "@/routes/PreviewDetailPage";
import { AppErrorBoundary } from "@/shared/error-boundary";
import { Button, Surface, Text } from "@/shared/ui";

type StackParams = { Overview: undefined; Detail: { title: string }; DictionaryDetail: { lexemeId: string; senseId?: string } };
const Stack = createNativeStackNavigator<StackParams>();

interface QueryScreenProps { children: (fetchKey: number) => ReactNode; refreshOnFocus?: boolean }
function QueryScreen({ children, refreshOnFocus = false }: QueryScreenProps) {
  const focused = useIsFocused();
  const [attempt, setAttempt] = useState(0);
  if (refreshOnFocus && !focused) return null;
  return <AppErrorBoundary key={attempt} fallback={() => <Surface tone="background" style={{ flex: 1, justifyContent: "center", padding: 24, gap: 16 }}>
    <Text accessibilityRole="alert">내용을 불러오지 못했어요. 연결 상태를 확인하고 다시 시도해 주세요.</Text>
    <Button label="다시 불러오기" onPress={() => setAttempt((value) => value + 1)} />
  </Surface>}>
    <Suspense fallback={<View style={{ flex: 1, justifyContent: "center", gap: 12 }}><ActivityIndicator /><Text style={{ textAlign: "center" }}>불러오는 중…</Text></View>}>{children(attempt)}</Suspense>
  </AppErrorBoundary>;
}

interface ScreenStackProps { destination: "Home" | "Library" | "Search" }
function ScreenStack({ destination }: ScreenStackProps) {
  return <Stack.Navigator screenOptions={{ headerBackButtonDisplayMode: "minimal" }}>
    <Stack.Screen name="Overview" options={{ title: destination, headerLargeTitle: true }}>
      {({ navigation }) => destination === "Home" ? <HomePage onOpenDetail={(title) => navigation.navigate("Detail", { title })} /> :
        destination === "Library" ? <QueryScreen refreshOnFocus>{(fetchKey) => <LibraryPage fetchKey={fetchKey} onOpenDetail={(lexemeId, senseId) => navigation.navigate("DictionaryDetail", { lexemeId, senseId })} />}</QueryScreen> :
        <QueryScreen>{(fetchKey) => <SearchPage fetchKey={fetchKey} onOpenDetail={(lexemeId) => navigation.navigate("DictionaryDetail", { lexemeId })} />}</QueryScreen>}
    </Stack.Screen>
    <Stack.Screen name="Detail" options={({ route }) => ({ title: route.params.title })}>
      {({ route, navigation }) => <PreviewDetailPage title={route.params.title} onOpenDetail={(title) => navigation.push("Detail", { title })} />}
    </Stack.Screen>
    <Stack.Screen name="DictionaryDetail" options={{ title: "뜻과 예문" }}>
      {({ route }) => <QueryScreen>{(fetchKey) => <DictionaryDetailPage fetchKey={fetchKey} lexemeId={route.params.lexemeId} selectedSenseId={route.params.senseId} />}</QueryScreen>}
    </Stack.Screen>
  </Stack.Navigator>;
}

export function HomeStack() { return <ScreenStack destination="Home" />; }
export function LibraryStack() { return <ScreenStack destination="Library" />; }
export function SearchStack() { return <ScreenStack destination="Search" />; }
