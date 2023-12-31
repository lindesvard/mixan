import { useEffect } from 'react';
import { ContentHeader, ContentSection } from '@/components/Content';
import { InputError } from '@/components/forms/InputError';
import { SettingsLayout } from '@/components/layouts/SettingsLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/use-toast';
import { ChangePassword } from '@/components/user/ChangePassword';
import { createServerSideProps } from '@/server/getServerSideProps';
import { api, handleError } from '@/utils/api';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

export const getServerSideProps = createServerSideProps();

const validator = z.object({
  name: z.string().min(2),
  email: z.string().email(),
});

type IForm = z.infer<typeof validator>;

export default function Profile() {
  const query = api.user.current.useQuery();
  const mutation = api.user.update.useMutation({
    onSuccess() {
      toast({
        title: 'Profile updated',
        description: 'Your profile has been updated.',
      });
      query.refetch();
    },
    onError: handleError,
  });
  const data = query.data;

  const { register, handleSubmit, reset, formState } = useForm<IForm>({
    resolver: zodResolver(validator),
    defaultValues: {
      name: '',
      email: '',
    },
  });

  useEffect(() => {
    if (data) {
      reset(data);
    }
  }, [data, reset]);

  return (
    <SettingsLayout>
      <form
        onSubmit={handleSubmit((values) => mutation.mutate(values))}
        className="flex flex-col divide-y divide-border"
      >
        <ContentHeader title="Profile" text="View and update your profile">
          <Button type="submit" disabled={!formState.isDirty}>
            Save
          </Button>
        </ContentHeader>
        <ContentSection
          title="Name"
          text={[
            'Your full name',
            <InputError key="error" {...formState.errors.name} />,
          ]}
        >
          <Input {...register('name')} />
        </ContentSection>
        <ContentSection
          title="Mail"
          text={[
            'Your email address',
            <InputError key="error" {...formState.errors.email} />,
          ]}
        >
          <Input {...register('email')} />
        </ContentSection>
      </form>

      <div className="mt-8">
        <ChangePassword />
      </div>
    </SettingsLayout>
  );
}
