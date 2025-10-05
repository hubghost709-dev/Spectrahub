import { redirect } from "next/navigation";
import React, { Suspense } from "react";
import Results from "./_components/results";
import { ResultsSkeleton } from "./_components/results"; // Cambié el import para coincidir con la exportación

type Props = {
  searchParams: {
    term?: string;
  };
};

async function SearchPage({ searchParams: { term } }: Props) {
  if (!term) {
    redirect("/?error=missing-term");
  }

  return (
    <div className="h-full p-8 max-w-screen-2xl mx-auto">
      <Suspense fallback={<ResultsSkeleton />}>
        {/* Cambié 'data' a 'term' */}
        <Results term={term} />
      </Suspense>
    </div>
  );
}

export default SearchPage;
