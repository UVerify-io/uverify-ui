import DefaultTemplate from './Default';
import MonochromeTemplate from './Monochrome';
import { Template } from './Template';

export type Templates = {
  [key: string]: Template;
};

export const templates: Templates = {
  default: new DefaultTemplate(),
  monochrome: new MonochromeTemplate(),
};
