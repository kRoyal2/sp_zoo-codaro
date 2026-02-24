"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

export default function OnboardingPage() {
  const router = useRouter();
  const createWorkspace = useMutation(api.workspaces.createWorkspace);

  const [name, setName] = useState("");
  const [industry, setIndustry] = useState("");
  const [teamSize, setTeamSize] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await createWorkspace({
        name: name.trim(),
        industry: industry || undefined,
        teamSize: teamSize || undefined,
      });
      router.push("/dashboard");
    } catch (error) {
      console.error("Failed to create workspace:", error);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0F1115] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-[480px]">
        {/* Logo */}
        <div className="mb-12 text-center">
          <span className="text-sm font-semibold tracking-wider text-white uppercase opacity-90">
            CoreStack OS
          </span>
        </div>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Create Your Workspace
          </h1>
          <p className="text-gray-400 text-sm leading-relaxed">
            Set up your operational environment to begin managing your team and workflows.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Workspace Name */}
          <div className="space-y-2">
            <label htmlFor="workspace-name" className="block text-sm font-medium text-gray-300">
              Workspace Name <span className="text-blue-500">*</span>
            </label>
            <input
              id="workspace-name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isSubmitting}
              className="w-full px-4 py-3 bg-[#1A1D24] text-white border border-[#2A2E39] rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all disabled:opacity-50"
              placeholder="e.g. Acme Corp"
            />
          </div>

          {/* Industry */}
          <div className="space-y-2">
            <label htmlFor="industry" className="block text-sm font-medium text-gray-300 relative">
              Industry <span className="text-gray-500 font-normal">(optional)</span>
            </label>
            <div className="relative">
              <select
                id="industry"
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                disabled={isSubmitting}
                className="w-full px-4 py-3 bg-[#1A1D24] text-white border border-[#2A2E39] rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all appearance-none disabled:opacity-50"
              >
                <option value="" className="bg-[#1A1D24] text-gray-400">Select industry</option>
                <option value="Technology" className="bg-[#1A1D24]">Technology</option>
                <option value="Finance" className="bg-[#1A1D24]">Finance</option>
                <option value="Healthcare" className="bg-[#1A1D24]">Healthcare</option>
                <option value="Education" className="bg-[#1A1D24]">Education</option>
                <option value="Retail" className="bg-[#1A1D24]">Retail</option>
                <option value="Other" className="bg-[#1A1D24]">Other</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-400">
                <svg className="h-4 w-4 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Team Size */}
          <div className="space-y-2 pb-2">
            <label htmlFor="team-size" className="block text-sm font-medium text-gray-300">
              Team Size <span className="text-gray-500 font-normal">(optional)</span>
            </label>
            <div className="relative">
              <select
                id="team-size"
                value={teamSize}
                onChange={(e) => setTeamSize(e.target.value)}
                disabled={isSubmitting}
                className="w-full px-4 py-3 bg-[#1A1D24] text-white border border-[#2A2E39] rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all appearance-none disabled:opacity-50"
              >
                <option value="" className="bg-[#1A1D24] text-gray-400">Select team size</option>
                <option value="1-10" className="bg-[#1A1D24]">1-10 employees</option>
                <option value="11-50" className="bg-[#1A1D24]">11-50 employees</option>
                <option value="51-200" className="bg-[#1A1D24]">51-200 employees</option>
                <option value="201-500" className="bg-[#1A1D24]">201-500 employees</option>
                <option value="500+" className="bg-[#1A1D24]">500+ employees</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-400">
                <svg className="h-4 w-4 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting || !name.trim()}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium py-3.5 px-4 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-[#0F1115] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center h-[52px]"
          >
            {isSubmitting ? (
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              "Continue"
            )}
          </button>
          
          <p className="text-center text-xs text-gray-500 mt-4">
            You can update these details later.
          </p>
        </form>
      </div>
    </div>
  );
}
