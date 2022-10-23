import { Button, Loader } from "@snailycad/ui";
import { FormField } from "components/form/FormField";
import { Select } from "components/form/Select";
import { Modal } from "components/modal/Modal";
import { ContextMenu } from "components/shared/ContextMenu";
import { Form, Formik } from "formik";
import useFetch from "lib/useFetch";
import { Full911Call, useCall911State } from "state/dispatch/call911State";
import { useModal } from "state/modalState";
import { ModalIds } from "types/ModalIds";
import { useTranslations } from "use-intl";

interface Props {
  call: Full911Call;
}

export function CallCaseNumberColumn({ call }: Props) {
  const { isOpen, closeModal, openModal } = useModal();
  const { calls } = useCall911State();
  const { state } = useFetch();
  const common = useTranslations("Common");

  async function handleSubmit(data: typeof INITIAL_VALUES) {
    console.log({ data });
  }

  const INITIAL_VALUES = {
    callIds: [],
  };

  return (
    <>
      <ContextMenu
        items={[
          {
            name: "Merge",
            onClick: () => openModal(ModalIds.MergeCalls),
          },
        ]}
      >
        #{call.caseNumber}
      </ContextMenu>

      <Modal
        isOpen={isOpen(ModalIds.MergeCalls)}
        onClose={() => closeModal(ModalIds.MergeCalls)}
        title="Merge Calls"
        className="w-[550px]"
      >
        <Formik onSubmit={handleSubmit} initialValues={INITIAL_VALUES}>
          {({ handleChange, values, errors, isValid }) => (
            <Form>
              <FormField errorMessage={errors.callIds} label="Case Numbers">
                <Select
                  isMulti
                  name="callIds"
                  onChange={handleChange}
                  value={values.callIds}
                  values={calls
                    .filter((v) => v.id !== call.id)
                    .map((call) => ({
                      label: `#${call.caseNumber}`,
                      value: call.id,
                    }))}
                />
              </FormField>

              <footer className="flex justify-end mt-5">
                <Button
                  type="reset"
                  onPress={() => closeModal(ModalIds.ManageLicenses)}
                  variant="cancel"
                >
                  {common("cancel")}
                </Button>
                <Button
                  className="flex items-center"
                  disabled={!isValid || state === "loading"}
                  type="submit"
                >
                  {state === "loading" ? <Loader className="mr-2" /> : null}
                  {common("save")}
                </Button>
              </footer>
            </Form>
          )}
        </Formik>
      </Modal>
    </>
  );
}
