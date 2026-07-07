import {
  Template,
  type ThemeSettings,
  type UVerifyCertificate,
  type UVerifyCertificateExtraData,
  type UVerifyMetadata,
} from '@uverify/core';
import type { JSX } from 'react';
import ProductVerificationView from './ProductVerificationView';

class ProductVerificationTemplate extends Template {
  public name = 'ProductVerification';
  public defaultUpdatePolicy = 'first' as const;

  public theme: Partial<ThemeSettings> = {
    background: 'bg-linear-to-br from-pink-100 via-purple-100 to-blue-100',
    footer: {
      hide: true,
    },
  };

  public layoutMetadata = {
    productName: 'Name of the product',
    manufacturer: 'Manufacturer name',
    productionDate: 'Date of production',
    materialInfo: 'Material and care information',
    serialNumber: 'Unique serial number',
    imageUrl: 'URL to product image',
  };

  public render(
    _hash: string,
    metadata: UVerifyMetadata,
    certificate: UVerifyCertificate | undefined,
    _pagination: JSX.Element,
    extra: UVerifyCertificateExtraData,
  ): JSX.Element {
    return (
      <ProductVerificationView
        metadata={metadata}
        certificate={certificate}
        extra={extra}
      />
    );
  }
}

export default ProductVerificationTemplate;
