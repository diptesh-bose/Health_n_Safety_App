
import React from 'react';
import { ShieldCheck, AlertTriangle, ListChecks, Eye, FileText, Mail } from 'lucide-react';
import { AppName, NAV_ITEMS } from '../constants';
import { Link } from 'react-router-dom';

const DashboardPage: React.FC = () => {
  const features = [
    { name: "Analyze New Safety Rules", path: "/analyze-rules", icon: FileText, description: "Upload and summarize new safety regulations, ask clarifying questions to understand their impact." },
    { name: "Prepare Safety Checklist", path: "/prepare-checklist", icon: ListChecks, description: "Update existing safety checklists to comply with new regulations using AI assistance." },
    { name: "H&S Risk Detection", path: "/risk-detection", icon: Eye, description: "Analyze images from worksites to identify potential hazards and unsafe conditions." },
    { name: "Review Contractor's Plan", path: "/review-plan", icon: AlertTriangle, description: "Assess contractor H&S plans, summarize scope, and check for compliance." },
    { name: "Create Violations Report", path: "/create-report", icon: FileText, description: "Consolidate findings from inspections into a comprehensive safety violations report." },
    { name: "Draft Urgent Email", path: "/draft-email", icon: Mail, description: "Quickly draft urgent communications regarding severe safety violations to stakeholders." },
  ];

  return (
    <div className="space-y-8">
      <div className="p-8 bg-gradient-to-r from-sky-600 to-cyan-500 text-white rounded-lg shadow-xl">
        <div className="flex items-center space-x-4">
          <ShieldCheck size={64} />
          <div>
            <h1 className="text-4xl font-bold">Welcome to {AppName}</h1>
            <p className="text-lg mt-2 opacity-90">Your AI-powered assistant for enhancing Health & Safety in oil and natural gas operations.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((feature) => {
           const NavIcon = feature.icon;
           return (
            <Link to={feature.path} key={feature.name} className="block p-6 bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 ease-in-out transform hover:-translate-y-1">
              <div className="flex items-center text-sky-600 mb-3">
                <NavIcon size={28} className="mr-3"/>
                <h2 className="text-xl font-semibold ">{feature.name}</h2>
              </div>
              <p className="text-sm text-slate-600">{feature.description}</p>
            </Link>
           );
        })}
      </div>

       <div className="mt-8 p-6 bg-white rounded-lg shadow">
        <h3 className="text-xl font-semibold text-slate-700 mb-3">Getting Started</h3>
        <p className="text-slate-600">
          Select a module from the sidebar or click on one of the feature cards above to begin. 
          This tool is designed to help you streamline safety inspections, understand complex regulations, 
          and proactively identify risks to create a safer work environment.
        </p>
      </div>
    </div>
  );
};

export default DashboardPage;
