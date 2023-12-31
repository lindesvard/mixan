import { useCallback, useEffect } from 'react';
import { Container } from '@/components/Container';
import { MainLayout } from '@/components/layouts/MainLayout';
import { PageTitle } from '@/components/PageTitle';
import { Chart } from '@/components/report/chart';
import { useReportId } from '@/components/report/hooks/useReportId';
import { ReportChartType } from '@/components/report/ReportChartType';
import { ReportDateRange } from '@/components/report/ReportDateRange';
import { ReportInterval } from '@/components/report/ReportInterval';
import { ReportSaveButton } from '@/components/report/ReportSaveButton';
import { reset, setName, setReport } from '@/components/report/reportSlice';
import { ReportSidebar } from '@/components/report/sidebar/ReportSidebar';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { popModal, pushModal } from '@/modals';
import { useDispatch, useSelector } from '@/redux';
import { createServerSideProps } from '@/server/getServerSideProps';
import { api } from '@/utils/api';
import { Pencil } from 'lucide-react';

export const getServerSideProps = createServerSideProps();

export default function Page() {
  const { reportId } = useReportId();
  const dispatch = useDispatch();
  const report = useSelector((state) => state.report);
  const reportQuery = api.report.get.useQuery(
    { id: String(reportId) },
    {
      enabled: Boolean(reportId),
    }
  );

  // Set report if reportId exists
  useEffect(() => {
    if (reportId && reportQuery.data) {
      dispatch(setReport(reportQuery.data));
    }

    if (!reportId) {
      dispatch(reset());
    }

    // Reset report state before leaving
    return () => {
      dispatch(reset());
    };
  }, [reportId, reportQuery.data, dispatch]);

  return (
    <Sheet>
      <MainLayout>
        <Container>
          <PageTitle>
            <span className="flex items-center gap-4">
              {report.name}
              <Button
                variant={'outline'}
                onClick={() => {
                  pushModal('EditReport', {
                    form: {
                      name: report.name,
                    },
                    onSubmit: (values) => {
                      dispatch(setName(values.name));
                      popModal('EditReport');
                    },
                  });
                }}
              >
                <Pencil size={16} />
              </Button>
            </span>
          </PageTitle>
          <div className="flex flex-col gap-4 mt-8">
            <div className="flex flex-col gap-4">
              <ReportDateRange />
              <div className="flex flex-col sm:flex-row gap-4 justify-between">
                <div className="flex gap-4">
                  <ReportChartType />
                  <ReportInterval />
                </div>
                <div className="flex gap-4">
                  <SheetTrigger asChild>
                    <Button size="default">Select events & filters</Button>
                  </SheetTrigger>
                  <ReportSaveButton />
                </div>
              </div>
            </div>
            <Chart {...report} editMode />
          </div>
        </Container>
      </MainLayout>
      <SheetContent className="!max-w-lg w-full">
        <ReportSidebar />
      </SheetContent>
    </Sheet>
  );
}
