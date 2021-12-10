import React from 'react';
import { StringField, StringFieldProps } from './StringField';

export type PasswordFieldProps = StringFieldProps;

export function PasswordField(props: PasswordFieldProps) {
  return <StringField {...props} type="password" />;
}
