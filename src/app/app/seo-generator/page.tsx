import { GeneratorForm } from "@/components/seo/generator-form";

export default function SEOGeneratorPage() {
  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <div className="px-4 lg:px-6">
            <div className="mb-6">
              <h1 className="text-3xl font-bold mb-2">Description Generator (AI/SEO)</h1>
              <p className="text-muted-foreground">
                Optimize your Propertyfinder listings in seconds with AI-powered descriptions
              </p>
            </div>
            <GeneratorForm />
          </div>
        </div>
      </div>
    </div>
  );
}
