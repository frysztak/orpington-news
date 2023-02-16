import type { NextPageWithLayout } from './types';
import Error from 'next/error';

const Page: NextPageWithLayout = Error;

Page.getLayout = (page) => {
  return page;
};

export default Page;
