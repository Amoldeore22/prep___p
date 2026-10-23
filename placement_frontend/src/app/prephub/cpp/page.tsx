import PrepHubSubjectView from "@/components/prephub/PrepHubSubjectView";

export const metadata = {
  title: "C++ Videos | Prep Hub",
  description: "C++ and STL topic-wise video tutorials for placement preparation.",
};

export default function CppPrepHubPage() {
  return <PrepHubSubjectView subject="CPP" />;
}
