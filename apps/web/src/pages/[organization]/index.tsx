import { Card } from '@/components/Card';
import { Container } from '@/components/Container';
import { MainLayout } from '@/components/layouts/MainLayout';
import { PageTitle } from '@/components/PageTitle';
import { useOrganizationParams } from '@/hooks/useOrganizationParams';
import { createServerSideProps } from '@/server/getServerSideProps';
import { api } from '@/utils/api';
import Link from 'next/link';

export const getServerSideProps = createServerSideProps();

export default function Home() {
  const params = useOrganizationParams();

  const query = api.project.list.useQuery(
    {
      organizationSlug: params.organization,
    },
    {
      enabled: !!params.organization,
    }
  );

  const projects = query.data ?? [];

  return (
    <MainLayout>
      <Container>
        <PageTitle>Projects</PageTitle>
        <div className="grid sm:grid-cols-2 gap-4">
          {projects.map((item) => (
            <Card key={item.id} hover>
              <Link
                href={`/${params.organization}/${item.slug}`}
                className="block p-4 font-medium leading-none"
                shallow
              >
                {item.name}
              </Link>
            </Card>
          ))}
        </div>
      </Container>
    </MainLayout>
  );
}
