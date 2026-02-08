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
  public whitelist = [
    'addr1qx5sntqjtgyxqhxrgk9tusxn4d4l779p6vupgnhcw8qng5jpzxceaupuyg04ft759k29yucngkf50zdxmj0rn8jjgmasdlampf',
    'addr_test1qrsvfa4tsqemxv5gxz2ngtxjqs62axd8rhfspf7rf2fc0ff4y7x36llgd5535syfm4u7v59sg4puqjt8z98gqy37dupsk6snpk',
  ];
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
