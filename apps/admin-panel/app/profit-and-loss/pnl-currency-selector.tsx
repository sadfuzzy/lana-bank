"use client"
import React from "react"
import { useTranslations } from "next-intl"
import { Label } from "@lana/web/ui/label"
import { RadioGroup, RadioGroupItem } from "@lana/web/ui/radio-group"

import { Currency } from "@/components/balance/balance"

interface CurrencySelectionProps {
  currency: Currency
  setCurrency: (currency: Currency) => void
}

export const PnlCurrencySelection: React.FC<CurrencySelectionProps> = ({
  currency,
  setCurrency,
}) => {
  const t = useTranslations("CurrencyLayerSelection")
  return (
    <div className="flex items-center py-3 mt-2">
      <div className="w-28">{t("currency.label")}:</div>
      <RadioGroup
        className="flex items-center space-x-4"
        value={currency}
        onValueChange={(v: Currency) => setCurrency(v)}
      >
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="usd" id="currency-usd" />
          <Label htmlFor="currency-usd">{t("currency.options.usd")}</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="btc" id="currency-btc" />
          <Label htmlFor="currency-btc">{t("currency.options.btc")}</Label>
        </div>
      </RadioGroup>
    </div>
  )
}

interface LayerSelectionProps {
  layer: PnlLayers
  setLayer: (layer: PnlLayers) => void
}

export const PnlLayerSelection: React.FC<LayerSelectionProps> = ({ layer, setLayer }) => {
  const t = useTranslations("CurrencyLayerSelection")

  return (
    <div className="flex items-center py-3">
      <div className="w-28">{t("layer.label")}:</div>
      <RadioGroup
        className="flex items-center space-x-4"
        value={layer}
        onValueChange={(v: PnlLayers) => setLayer(v)}
      >
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="settled" id="layer-settled" />
          <Label htmlFor="layer-settled">{t("layer.options.settled")}</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="pending" id="layer-pending" />
          <Label htmlFor="layer-pending">{t("layer.options.pending")}</Label>
        </div>
      </RadioGroup>
    </div>
  )
}
