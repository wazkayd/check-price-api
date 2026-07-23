function isPublicStoreVisible(store) {
  return Boolean(store?.isVerified && store?.status === 'VERIFIED');
}

function isPublicProductVisible(product) {
  return Boolean(product?.isAvailable);
}

function isPublicPriceVisible(productPrice) {
  return isPublicProductVisible(productPrice?.product) && isPublicStoreVisible(productPrice?.store);
}

module.exports = {
  isPublicStoreVisible,
  isPublicProductVisible,
  isPublicPriceVisible,
};
