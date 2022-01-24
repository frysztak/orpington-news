import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Form, Formik } from 'formik';
import * as Yup from 'yup';
import { Box, Button, HStack, VStack } from '@chakra-ui/react';
import {
  Collection,
  CollectionIcons,
  CollectionIconType,
  defaultIcon,
  defaultRefreshInterval,
  ID,
  toStringWithoutExponent,
} from '@orpington-news/shared';
import { NumberField, SelectField, StringField } from '@components/forms';
import { CollectionIconField } from './CollectionIconField';
import { flattenCollections } from './flattenCollections';

export interface AddCollectionFormProps {
  initialData?: AddCollectionFormData;

  isLoading: boolean;
  isUrlVerified: boolean;

  areCollectionsLoading?: boolean;
  collections: Collection[];

  onVerifyUrlChanged?: (url?: string) => void;
  onVerifyUrlClicked?: (url: string) => void;
  onSubmit: (data: AddCollectionFormData) => void;
}

export interface AddCollectionFormData {
  url?: string;
  title: string;
  description?: string;
  icon: CollectionIconType;
  parentId?: ID;
  refreshInterval?: number;
}

type InternalFormData = Omit<
  AddCollectionFormData,
  'parentId' | 'refreshInterval'
> & {
  parentId?: string;
  refreshInterval?: string;
};

const validationSchema = Yup.object({
  url: Yup.string().url('Please enter valid URL').nullable(),
  title: Yup.string().required('Please enter title'),
  description: Yup.string(),
  icon: Yup.string().oneOf(CollectionIcons as unknown as string[]),
  parentId: Yup.string().optional(),
});

interface FieldListenerProps<T extends unknown> {
  value: T;
  setter: (x: T) => void;
}

const FieldListener = <T,>(props: FieldListenerProps<T>) => {
  const { value, setter } = props;
  useEffect(() => {
    setter(value);
  }, [setter, value]);
  return null;
};

export const AddCollectionForm: React.FC<AddCollectionFormProps> = (props) => {
  const {
    initialData,
    isLoading,
    isUrlVerified,
    areCollectionsLoading,
    collections,
    onVerifyUrlChanged,
    onVerifyUrlClicked,
    onSubmit,
  } = props;

  const parentOptions = useMemo(
    () => [
      { value: 'none', label: 'No parent' },
      ...flattenCollections(collections),
    ],
    [collections]
  );

  const [feedUrl, setFeedUrl] = useState<string>();

  const handleVerifyUrlClicked = useCallback(() => {
    if (feedUrl) {
      onVerifyUrlClicked?.(feedUrl);
    } else {
      console.error(`feedUrl is falsy!`);
    }
  }, [feedUrl, onVerifyUrlClicked]);

  const handleSubmit = useCallback(
    (data: InternalFormData) => {
      onSubmit({
        ...data,
        url: feedUrl ?? initialData?.url ?? '',
        refreshInterval: data.refreshInterval
          ? +data.refreshInterval
          : undefined,
        parentId:
          data.parentId && data.parentId !== 'none'
            ? +data.parentId
            : undefined,
      });
    },
    [feedUrl, initialData?.url, onSubmit]
  );

  const initialValues: InternalFormData = useMemo(() => {
    return initialData
      ? {
          ...initialData,
          parentId: toStringWithoutExponent(initialData.parentId),
          refreshInterval: toStringWithoutExponent(initialData.refreshInterval),
        }
      : {
          url: '',
          title: '',
          icon: defaultIcon,
          refreshInterval: toStringWithoutExponent(defaultRefreshInterval),
        };
  }, [initialData]);

  useEffect(() => {
    onVerifyUrlChanged?.(feedUrl);
  }, [feedUrl, onVerifyUrlChanged]);

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={handleSubmit}
      enableReinitialize
    >
      {({ values, errors }) => (
        <Form noValidate>
          <VStack spacing={4} w="full">
            <StringField
              name="url"
              label="RSS/Atom feed URL"
              placeholder="Feed URL"
              isDisabled={isLoading}
            />
            <FieldListener value={values.url} setter={setFeedUrl} />

            <HStack w="full" justify="flex-end">
              <Button
                w={['full', 40]}
                isLoading={isLoading}
                onClick={handleVerifyUrlClicked}
                isDisabled={
                  isLoading || !values.url || !!errors.url || isUrlVerified
                }
              >
                Verify URL
              </Button>
            </HStack>

            <HStack w="full" align="flex-start" spacing={0}>
              <Box flexShrink={0} w={24}>
                <CollectionIconField
                  name="icon"
                  label="Feed icon"
                  isRequired
                  isDisabled={isLoading}
                />
              </Box>

              <StringField
                name="title"
                label="Feed name"
                placeholder="Feed name"
                isRequired
                isDisabled={isLoading}
              />
            </HStack>

            <StringField
              name="description"
              label="Feed description"
              placeholder="Feed description"
              isDisabled={isLoading}
            />

            <SelectField
              name="parentId"
              label="Parent"
              isLoading={areCollectionsLoading}
              isDisabled={isLoading}
              options={parentOptions}
            />

            <NumberField
              name="refreshInterval"
              label="Refresh interval (minutes)"
              decimalSeparator="0"
              isLoading={areCollectionsLoading}
              isDisabled={isLoading}
              options={parentOptions}
            />

            <HStack w="full" justify="flex-end">
              <Button
                w={['full', 40]}
                type="submit"
                isLoading={isLoading}
                isDisabled={Boolean(values.url) && !isUrlVerified}
              >
                {initialData ? 'Save' : 'Add'}
              </Button>
            </HStack>
          </VStack>
        </Form>
      )}
    </Formik>
  );
};
