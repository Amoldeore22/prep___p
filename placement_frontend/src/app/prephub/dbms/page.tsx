import PrepHubSubjectView from "@/components/prephub/PrepHubSubjectView";

export const metadata = {
  title: "DBMS Videos | Prep Hub",
  description: "Database Management Systems concepts, ACID, and normalization video tutorials.",
};

export default function DbmsPrepHubPage() {
  return <PrepHubSubjectView subject="DBMS" />;
}
