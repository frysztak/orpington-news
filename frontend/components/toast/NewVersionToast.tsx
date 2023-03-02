import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Box,
  Button,
  CloseButton,
  ToastId,
} from '@chakra-ui/react';

export interface NewVersionToastProps {
  id?: ToastId;
  isReloading: boolean;
  onClose: () => void;
  onReload: () => void;
}

export const NewVersionToast: React.FC<NewVersionToastProps> = (props) => {
  const { id, isReloading, onClose, onReload } = props;

  const alertTitleId =
    typeof id !== 'undefined' ? `toast-${id}-title` : undefined;

  return (
    <Alert
      status="info"
      variant="solid"
      id={String(id)}
      alignItems="start"
      borderRadius="md"
      boxShadow="lg"
      paddingEnd={8}
      textAlign="start"
      width="auto"
      aria-labelledby={alertTitleId}
    >
      <AlertIcon />
      <Box flex="1" maxWidth="100%">
        <AlertTitle id={alertTitleId}>Update available</AlertTitle>

        <AlertDescription display="flex" flexDirection="column">
          A newer version is available, reload to update? <br />
          <Button
            onClick={onReload}
            isLoading={isReloading}
            mt={2}
            ml="auto"
            variant="solid"
            size="sm"
          >
            Reload
          </Button>
        </AlertDescription>
      </Box>
      <CloseButton
        size="sm"
        onClick={onClose}
        position="absolute"
        insetEnd={1}
        top={1}
      />
    </Alert>
  );
};
