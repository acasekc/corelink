import React from "react";
import { Link } from "react-router-dom";
import { caseStudies } from "../data/caseStudies";

export default function CaseStudiesList() {
  return (
    <div className="max-w-4xl mx-auto py-16 px-4">
      <h1 className="text-4xl font-bold mb-8">Case Studies</h1>
      <div className="grid gap-8 md:grid-cols-2">
        {caseStudies.map(cs => (
          <div key={cs.slug} className="bg-white rounded-lg shadow p-6">
            {/* <img src={cs.image} alt={cs.title} className="mb-4 rounded" /> */}
            <h2 className="text-2xl font-semibold mb-2">{cs.title}</h2>
            <p className="mb-4">{cs.summary}</p>
            <Link to={`/case-studies/${cs.slug}`} className="text-blue-600 hover:underline">Read More</Link>
          </div>
        ))}
      </div>
    </div>
  );
}
