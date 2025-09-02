export type ReceivingAddress = {
  asset: string
  network: string
  address: string
}

export function getReceivingAddresses(): ReceivingAddress[] {
  const env = process.env.RECEIVING_ADDRESSES || ''
  return env
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
    .map((entry) => {
      const [asset, network, address] = entry.split(':')
      return { asset, network, address }
    })
    .filter((x) => x.asset && x.network && x.address)
}

export function getSupportedAssets() {
  return Array.from(new Set(getReceivingAddresses().map((a) => a.asset)))
}

export function getNetworksForAsset(asset: string) {
  return getReceivingAddresses()
    .filter((a) => a.asset === asset)
    .map((a) => a.network)
}

export function findAddress(asset: string, network: string) {
  return getReceivingAddresses().find((a) => a.asset === asset && a.network === network)
}
