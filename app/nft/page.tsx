import { Transfer } from "@/components/transfer";
import CardLayout from "@/components/card-layout";

export default function TransactionPage() {
  return (
    <CardLayout title="Crypto Transfer" description="Transfer your crypto to another wallet" showBackButton>
      <Transfer />
    </CardLayout>
  );
}
