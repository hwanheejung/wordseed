import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { HomePage } from "@/routes/HomePage";
import { LibraryPage } from "@/routes/LibraryPage";
import { SearchPage } from "@/routes/SearchPage";
import { PreviewDetailPage } from "@/routes/PreviewDetailPage";

type StackParams = { Overview: undefined; Detail: { title: string } };
const Stack = createNativeStackNavigator<StackParams>();

interface ScreenStackProps { destination: "Home" | "Library" | "Search"; }

function ScreenStack({ destination }: ScreenStackProps) {
  const Page = { Home: HomePage, Library: LibraryPage, Search: SearchPage }[destination];
  return (
    <Stack.Navigator screenOptions={{ headerBackButtonDisplayMode: "minimal" }}>
      <Stack.Screen name="Overview" options={{
        title: destination,
        headerLargeTitle: true,
      }}>
        {({ navigation }) => <Page onOpenDetail={(title) => navigation.navigate("Detail", { title })} />}
      </Stack.Screen>
      <Stack.Screen name="Detail" options={({ route }) => ({ title: route.params.title })}>
        {({ route, navigation }) => <PreviewDetailPage title={route.params.title} onOpenDetail={(title) => navigation.push("Detail", { title })} />}
      </Stack.Screen>
    </Stack.Navigator>
  );
}

export function HomeStack() { return <ScreenStack destination="Home" />; }
export function LibraryStack() { return <ScreenStack destination="Library" />; }
export function SearchStack() { return <ScreenStack destination="Search" />; }
