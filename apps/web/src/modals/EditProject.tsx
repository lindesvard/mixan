import { useEffect } from 'react';
import { ButtonContainer } from '@/components/ButtonContainer';
import { InputWithLabel } from '@/components/forms/InputWithLabel';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { useRefetchActive } from '@/hooks/useRefetchActive';
import { api, handleError } from '@/utils/api';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { popModal } from '.';
import { ModalContent, ModalHeader } from './Modal/Container';

interface EditProjectProps {
  id: string;
}

const validator = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
});

type IForm = z.infer<typeof validator>;

export default function EditProject({ id }: EditProjectProps) {
  const refetch = useRefetchActive();
  const mutation = api.project.update.useMutation({
    onError: handleError,
    onSuccess() {
      toast({
        title: 'Success',
        description: 'Project updated.',
      });
      popModal();
      refetch();
    },
  });
  const query = api.project.get.useQuery({ id });
  const data = query.data;
  const { register, handleSubmit, reset, formState } = useForm<IForm>({
    resolver: zodResolver(validator),
    defaultValues: {
      id: '',
      name: '',
    },
  });

  useEffect(() => {
    if (data) {
      reset(data);
    }
  }, [data, reset]);

  return (
    <ModalContent>
      <ModalHeader title="Edit project" />
      <form
        onSubmit={handleSubmit((values) => {
          mutation.mutate(values);
        })}
      >
        <InputWithLabel label="Name" placeholder="Name" {...register('name')} />
        <ButtonContainer>
          <Button type="button" variant="outline" onClick={() => popModal()}>
            Cancel
          </Button>
          <Button type="submit" disabled={!formState.isDirty}>
            Save
          </Button>
        </ButtonContainer>
      </form>
    </ModalContent>
  );
}
