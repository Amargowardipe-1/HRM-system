import { cookies } from "next/headers";
import { getDesignations, getDepartments } from "@/lib/api";
import { DesignationsDashboard } from "@/components/designation/DesignationsDashboard";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function DesignationsPage({ searchParams }) {
  // In Next.js 15, searchParams is a Promise and must be awaited
  const params = await searchParams;
  const search = params.search || "";
  const department = params.department || "";
  const status = params.status || "";
  const page = params.page || "1";

  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value || "";

  // Fetch data server-side
  const [desigRes, depts] = await Promise.all([
    getDesignations(
      {
        search,
        department,
        status,
        page: Number(page),
        limit: 8,
      },
      token
    ).catch((err) => {
      console.error("Failed to fetch designations on server:", err.message);
      return { data: [], pagination: null };
    }),
    getDepartments(token).catch((err) => {
      console.error("Failed to fetch departments on server:", err.message);
      return [];
    }),
  ]);

  return (
    <DesignationsDashboard
      initialDesignations={desigRes.data}
      initialPagination={
        desigRes.pagination || {
          total: desigRes.data.length,
          page: Number(page),
          limit: 8,
          pages: 1,
        }
      }
      departments={depts}
      token={token}
      searchParams={{ search, department, status, page }}
    />
  );
}
