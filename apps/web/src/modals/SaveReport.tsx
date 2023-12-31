import { useEffect } from 'react';
import { ButtonContainer } from '@/components/ButtonContainer';
import { InputWithLabel } from '@/components/forms/InputWithLabel';
import { Button } from '@/components/ui/button';
import { Combobox } from '@/components/ui/combobox';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';
import { useOrganizationParams } from '@/hooks/useOrganizationParams';
import { useRefetchActive } from '@/hooks/useRefetchActive';
import type { IChartInput } from '@/types';
import { api, handleError } from '@/utils/api';
import { strip } from '@/utils/object';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/router';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';

import { popModal } from '.';
import { ModalContent, ModalHeader } from './Modal/Container';

interface SaveReportProps {
  report: IChartInput;
  reportId?: string;
}

const validator = z.object({
  name: z.string().min(1, 'Required'),
  dashboardId: z.string().min(1, 'Required'),
});

type IForm = z.infer<typeof validator>;

export default function SaveReport({ report }: SaveReportProps) {
  const router = useRouter();
  const { organization, project, dashboard } = useOrganizationParams();
  const refetch = useRefetchActive();
  const save = api.report.save.useMutation({
    onError: handleError,
    onSuccess(res) {
      toast({
        title: 'Success',
        description: 'Report saved.',
      });
      popModal();
      refetch();
      router.push({
        pathname: `/${organization}/${project}/reports/${res.id}`,
        query: strip({ dashboard }),
      });
    },
  });

  const { register, handleSubmit, formState, control, setValue } =
    useForm<IForm>({
      resolver: zodResolver(validator),
      defaultValues: {
        name: report.name,
        dashboardId: '',
      },
    });

  const dashboardMutation = api.dashboard.create.useMutation({
    onError: handleError,
    onSuccess(res) {
      setValue('dashboardId', res.id);
      dashboardQuery.refetch();
      toast({
        title: 'Success',
        description: 'Dashboard created.',
      });
    },
  });

  const dashboardQuery = api.dashboard.list.useQuery({
    projectSlug: project,
  });

  const dashboards = (dashboardQuery.data ?? []).map((item) => ({
    value: item.id,
    label: item.name,
  }));

  useEffect(() => {
    if (dashboard && dashboardQuery.data) {
      const match = dashboardQuery.data.find((item) => item.slug === dashboard);
      if (match) {
        setValue('dashboardId', match.id);
      }
    }
  }, [dashboard, dashboardQuery]);

  return (
    <ModalContent>
      <ModalHeader title="Edit client" />
      <form
        className="flex flex-col gap-4"
        onSubmit={handleSubmit(({ name, ...values }) => {
          save.mutate({
            report: {
              ...report,
              name,
            },
            ...values,
          });
        })}
      >
        <InputWithLabel
          label="Report name"
          placeholder="Name"
          {...register('name')}
          defaultValue={report.name}
        />
        <Controller
          control={control}
          name="dashboardId"
          render={({ field }) => {
            return (
              <div>
                <Label>Dashboard</Label>
                <Combobox
                  {...field}
                  items={dashboards}
                  placeholder="Select a dashboard"
                  onCreate={(value) => {
                    dashboardMutation.mutate({
                      projectSlug: project,
                      name: value,
                    });
                  }}
                />
              </div>
            );
          }}
        />
        <ButtonContainer>
          <Button type="button" variant="outline" onClick={() => popModal()}>
            Cancel
          </Button>
          <Button type="submit" disabled={!formState.isValid}>
            Save
          </Button>
        </ButtonContainer>
      </form>
    </ModalContent>
  );
}
