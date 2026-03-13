import {
  useForm,
  type FieldValues,
  type DefaultValues,
  type SubmitHandler,
  type UseFormProps,
} from "react-hook-form";

type UseFilterFormOptions<TForm extends FieldValues, TFilters> = {
  defaultValues: DefaultValues<TForm>;
  normalize: (values: TForm) => TFilters;
  onApply: (filters: TFilters) => void;
  onClear: (filters: TFilters) => void;
  formOptions?: Omit<UseFormProps<TForm>, "defaultValues">;
};

export function useFilterForm<TForm extends FieldValues, TFilters>(
  options: UseFilterFormOptions<TForm, TFilters>,
) {
  const { defaultValues, normalize, onApply, onClear, formOptions } = options;

  const form = useForm<TForm>({
    defaultValues,
    ...(formOptions ?? {}),
  });

  const handleApply: SubmitHandler<TForm> = (values) => {
    onApply(normalize(values));
  };

  const applyFilters = form.handleSubmit(handleApply);

  const clearFilters = () => {
    form.reset(defaultValues);
    onClear(normalize(form.getValues()));
  };

  return {
    ...form,
    registerFilters: form.register,
    applyFilters,
    clearFilters,
  };
}
