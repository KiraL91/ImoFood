import { FoodsExplorer } from "@/features/foods/foods-explorer";
import { foods } from "@/lib/mock/foods";

export default function FoodsPage() {
  return <FoodsExplorer foods={foods} />;
}
