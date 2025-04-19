import DefaultTemplate from './Default';
import DiplomaTemplate from './Diploma';
import LinktreeTemplate from './LinkTree/LinkTreeTemplate';
import MonochromeTemplate from './Monochrome';
import { Template } from './Template';

export type Templates = {
  [key: string]: Template;
};

export const templates: Templates = {
  default: new DefaultTemplate(),
  monochrome: new MonochromeTemplate(),
  diploma: new DiplomaTemplate(),
  linktree: new LinktreeTemplate(),
};
