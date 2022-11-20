import type { AnyValue, Value, ValueWithValueObj } from "@snailycad/types";
import { AsyncListSearchField, Item } from "@snailycad/ui";
import { useValues, ValueContext } from "context/ValuesContext";
import { useFormikContext } from "formik";
import { getValueStrFromValue } from "lib/admin/values/utils";

type ExtractType<T extends AnyValue> = T extends ValueWithValueObj
  ? T["value"]["type"]
  : T extends Value
  ? T["type"]
  : "PENAL_CODE";

interface Props<T extends AnyValue> {
  type: ExtractType<T>;
  autoFocus?: boolean;
  isClearable?: boolean;
  isDisabled?: boolean;
  isOptional?: boolean;
  fieldName: string;
  label: string;
}

export function ValueSelectField<T extends AnyValue>(props: Props<T>) {
  const searchValueKey = `${props.fieldName}-localValue`;
  const { errors, values, setValues } = useFormikContext<any>();
  const formattedType = props.type.toLowerCase();

  const useValuesKey = props.type.toLowerCase().replace("_", "") as keyof typeof useValues;
  const { [useValuesKey]: _values } = useValues();
  const valuesArr = (_values as ValueContext["bloodGroup"]).values as T[];

  return (
    <AsyncListSearchField<T>
      {...props}
      defaultItems={valuesArr}
      localValue={values[searchValueKey]}
      setValues={({ localValue, node }) => {
        if (typeof node === "undefined") return;

        const searchValue =
          typeof localValue !== "undefined" ? { [searchValueKey]: localValue } : {};
        const value = { [props.fieldName]: node?.key ?? null };

        setValues({ ...values, ...searchValue, ...value });
      }}
      errorMessage={errors[props.fieldName] as string}
      label={props.label}
      selectedKey={values[props.fieldName]}
      fetchOptions={{
        filterTextRequired: true,
        apiPath: (value) => `/admin/values/${formattedType}/search?query=${value}`,
        method: "GET",
      }}
    >
      {(item) => {
        const text = getValueStrFromValue(item);

        return (
          <Item key={item.id} textValue={text}>
            <div className="flex items-center">{text}</div>
          </Item>
        );
      }}
    </AsyncListSearchField>
  );
}
