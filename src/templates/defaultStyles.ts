import {
  FingerprintStyle,
  IdentityCardStyle,
  MetadataViewerStyle,
  PaginationStyle,
} from '@uverify/core';

export const defaultMetadataViewerStyle: MetadataViewerStyle = {
  border: {
    color: 'white',
    opacity: 30,
    hover: {
      color: 'white',
      opacity: 30,
    },
  },
};

export const defaultIdentityCardStyle: IdentityCardStyle = {
  border: {
    color: 'white',
    opacity: 30,
    hover: {
      color: 'white',
      opacity: 100,
    },
  },
  background: {
    color: 'white',
    opacity: 20,
    hover: {
      color: 'white',
      opacity: 40,
    },
  },
};

export const defaultFingerprintStyle: FingerprintStyle = {
  gradient: {
    color: {
      start: 'rgb(0, 190, 220)',
      end: 'rgb(5, 196, 139)',
    },
  },
};

export const defaultPaginationStyle: PaginationStyle = {
  border: {
    active: {
      color: 'border-white/60',
    },
    inactive: {
      color: 'border-white/30',
      hover: {
        color: 'border-white/40',
      },
    },
  },
  text: {
    active: {
      color: 'white',
      hover: {
        color: 'white',
      },
    },
    inactive: {
      color: 'white',
      hover: {
        color: 'white',
      },
    },
  },
  background: {
    active: {
      color: 'bg-white/50',
    },
    inactive: {
      color: 'bg-white/20',
      hover: {
        color: 'bg-white/30',
      },
    },
  },
};
