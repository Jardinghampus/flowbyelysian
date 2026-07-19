"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Copy, Loader2, Check } from "lucide-react";

type FormData = {
  originalText: string;
  targetAudience: string[];
  community: string[];
  features: string[];
  purpose: string[];
  tone: string[];
};

export function GeneratorForm() {
  const [formData, setFormData] = useState<FormData>({
    originalText: "",
    targetAudience: [],
    community: [],
    features: [],
    purpose: [],
    tone: [],
  });
  const [generatedText, setGeneratedText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCheckboxChange = (
    category: keyof Omit<FormData, "originalText">,
    value: string
  ) => {
    setFormData((prev) => {
      const current = prev[category];
      const updated = current.includes(value)
        ? current.filter((item) => item !== value)
        : [...current, value];
      return { ...prev, [category]: updated };
    });
  };

  const handleGenerate = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      setGeneratedText(data.optimizedText);
      void fetch("/api/team-feed/tool", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventType: "tool_description",
          title: "Generated a new listing description",
          areaName: formData.community[0] || "Dubai",
        }),
      });
    } catch (error) {
      console.error("Error generating text:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(generatedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const checkboxSections = [
    {
      title: "Target Audience",
      key: "targetAudience" as const,
      options: [
        "Families with children",
        "Young professionals",
        "Executives/C-suite",
        "Retirees/Empty nesters",
        "Investors",
        "Scandinavian expats",
      ],
    },
    {
      title: "Community",
      key: "community" as const,
      options: [
        "The Palm Jumeirah",
        "Al Furjan",
        "Tilal Al Ghaf",
        "Jumeirah Golf Estates",
        "The Oasis",
        "Arabian Ranches",
      ],
    },
    {
      title: "Property Features",
      key: "features" as const,
      options: [
        "Private pool",
        "Maid's room",
        "Garden/outdoor space",
        "Upgraded/renovated",
        "Smart home",
        "Home office/study",
        "Double garage",
      ],
    },
    {
      title: "Purpose",
      key: "purpose" as const,
      options: [
        "Rental listing",
        "Sale listing",
        "Off-market teaser",
        "Investment opportunity",
      ],
    },
    {
      title: "Tone",
      key: "tone" as const,
      options: [
        "Luxury/aspirational",
        "Practical/family-focused",
        "Investment-focused",
        "Lifestyle-driven",
      ],
    },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Original Draft</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Paste your property description here..."
              className="min-h-[200px]"
              value={formData.originalText}
              onChange={(e) =>
                setFormData({ ...formData, originalText: e.target.value })
              }
            />
          </CardContent>
        </Card>

        {checkboxSections.map((section) => (
          <Card key={section.key}>
            <CardHeader>
              <CardTitle className="text-lg">{section.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {section.options.map((option) => (
                  <div key={option} className="flex items-center space-x-2">
                    <Checkbox
                      id={`${section.key}-${option}`}
                      checked={formData[section.key].includes(option)}
                      onCheckedChange={() =>
                        handleCheckboxChange(section.key, option)
                      }
                    />
                    <Label
                      htmlFor={`${section.key}-${option}`}
                      className="text-sm font-normal cursor-pointer"
                    >
                      {option}
                    </Label>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}

        <Button
          onClick={handleGenerate}
          disabled={!formData.originalText || isLoading}
          className="w-full"
          size="lg"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            "Generate Optimized Description"
          )}
        </Button>
      </div>

      <div className="lg:sticky lg:top-8 lg:self-start">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Optimized Description</CardTitle>
              {generatedText && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopy}
                  className="ml-2"
                >
                  {copied ? (
                    <>
                      <Check className="mr-2 h-4 w-4" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="mr-2 h-4 w-4" />
                      Copy
                    </>
                  )}
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {generatedText ? (
              <div className="prose dark:prose-invert max-w-none">
                <p className="whitespace-pre-wrap">{generatedText}</p>
                <div className="mt-4 pt-4 border-t text-sm text-muted-foreground">
                  Word count: {generatedText.split(/\s+/).filter(Boolean).length}
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-12">
                Your optimized description will appear here
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
