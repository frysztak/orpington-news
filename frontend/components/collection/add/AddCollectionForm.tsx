import React, { useState, useCallback, useMemo } from 'react';
import { Form, Formik } from 'formik';
import * as Yup from 'yup';
import { Box, Button, HStack, VStack } from '@chakra-ui/react';
import {
  CollectionIcons,
  CollectionIconType,
  defaultIcon,
  defaultRefreshInterval,
  Collection,
  ID,
  numberToString,
} from '@shared';
import {
  FieldListener,
  NumberField,
  SelectField,
  StringField,
} from '@components/forms';
import { CollectionIconField } from './CollectionIconField';
import { flattenCollections } from './flattenCollections';

export interface AddCollectionFormProps {
  initialData?: AddCollectionFormData;

  isLoading: boolean;
  verifiedUrl?: string;

  areCollectionsLoading?: boolean;
  collections: Collection[];

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
  url: Yup.string()
    .test('isUrl', 'Please enter valid URL', (maybeUrl?: string) => {
      try {
        return Boolean(new URL(maybeUrl!));
      } catch {
        return maybeUrl ? false : true;
      }
    })
    .nullable(),
  title: Yup.string().required('Please enter title'),
  description: Yup.string().nullable(),
  icon: Yup.string().oneOf(CollectionIcons.options),
  parentId: Yup.string().optional(),
});

export const AddCollectionForm: React.FC<AddCollectionFormProps> = (props) => {
  const {
    initialData,
    isLoading,
    verifiedUrl,
    areCollectionsLoading,
    collections,
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
          parentId: numberToString(initialData.parentId),
          refreshInterval: numberToString(initialData.refreshInterval),
        }
      : {
          url: '',
          title: '',
          icon: defaultIcon,
          refreshInterval: numberToString(defaultRefreshInterval),
        };
  }, [initialData]);

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={handleSubmit}
      enableReinitialize
    >
      {({ values, errors }) => {
        const isUrlVerified = values.url === verifiedUrl;

        return (
          <Form noValidate>
            <VStack spacing={4} w="full">
              <StringField
                name="url"
                label="RSS/Atom feed URL"
                placeholder="Feed URL"
                isDisabled={isLoading}
                data-test="feedUrl"
              />
              <FieldListener value={values.url} cb={setFeedUrl} />

              <HStack w="full" justify="flex-end">
                <Button
                  w={['full', 40]}
                  isLoading={isLoading}
                  onClick={handleVerifyUrlClicked}
                  isDisabled={
                    isLoading || !values.url || !!errors.url || isUrlVerified
                  }
                  data-test="verifyUrl"
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
                  data-test="feedName"
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
                decimalScale={0}
                isLoading={areCollectionsLoading}
                isDisabled={isLoading}
              />

              <HStack w="full" justify="flex-end">
                <Button
                  w={['full', 40]}
                  type="submit"
                  isLoading={isLoading}
                  isDisabled={Boolean(values.url) && !isUrlVerified}
                  data-test="addFeedButton"
                >
                  {initialData ? 'Save' : 'Add'}
                </Button>
              </HStack>
            </VStack>
          </Form>
        );
      }}
    </Formik>
  );
};
