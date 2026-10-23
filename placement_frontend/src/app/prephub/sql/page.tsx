import PrepHubSubjectView from "@/components/prephub/PrepHubSubjectView";

export const metadata = {
  title: "SQL Videos | Prep Hub",
  description: "Structured Query Language, joins, and database queries video tutorials.",
};

export default function SqlPrepHubPage() {
  return <PrepHubSubjectView subject="SQL" />;
}
