"use client";
import * as React from "react";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { BrandList } from "@/components/features/brand-list";
import { BrandForm } from "@/components/features/brand-form";
import { Button } from "@/components/ui/button";
import { useBrands } from "@/hooks/use-brands";
import { MOCK_BRANDS } from "@/lib/mock-data";

export default function BrandsPage() {
 const { data: brands, isLoading } = useBrands();
 const displayBrands = brands || MOCK_BRANDS;

 return (
 <AppShell>
 <PageHeader title="Brands" subtitle="Manage and monitor your tracked brands" actions={<BrandForm onSave={async () => {}} />} />
 <BrandList brands={displayBrands} isLoading={isLoading} />
 </AppShell>
 );
}
