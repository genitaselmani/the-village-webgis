<?xml version="1.0" encoding="UTF-8"?>
<!-- Bizneset e The Village, të kategorizuara sipas fushës 'Kategoria'.
     Ngjyrat janë pikërisht ato të legjendës së WebGIS-it, që harta e WMS-së
     të lexohet njësoj si faqja. Zëvendëson Biznesetllogo.sld, i cili përdor
     variablën  të QGIS-it — GeoServer-i nuk e njeh atë dhe do
     t'i vizatonte pikat bosh. -->
<StyledLayerDescriptor version="1.0.0"
    xmlns="http://www.opengis.net/sld"
    xmlns:ogc="http://www.opengis.net/ogc"
    xmlns:xlink="http://www.w3.org/1999/xlink"
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xsi:schemaLocation="http://www.opengis.net/sld http://schemas.opengis.net/sld/1.0.0/StyledLayerDescriptor.xsd">
  <NamedLayer>
    <Name>Bizniset</Name>
    <UserStyle>
      <Name>bizniset_kategori</Name>
      <Title>Bizneset sipas kategorisë</Title>
      <FeatureTypeStyle>
    <Rule>
      <Name>Aksesore dhe kozmetike</Name>
      <Title>Aksesore dhe kozmetike</Title>
      <ogc:Filter>
        <ogc:PropertyIsEqualTo>
          <ogc:PropertyName>Kategoria</ogc:PropertyName>
          <ogc:Literal>Aksesore dhe kozmetike</ogc:Literal>
        </ogc:PropertyIsEqualTo>
      </ogc:Filter>
      <PointSymbolizer>
        <Graphic>
          <Mark>
            <WellKnownName>circle</WellKnownName>
            <Fill><CssParameter name="fill">#e91e8c</CssParameter></Fill>
            <Stroke>
              <CssParameter name="stroke">#2c3e50</CssParameter>
              <CssParameter name="stroke-width">1</CssParameter>
            </Stroke>
          </Mark>
          <Size>12</Size>
        </Graphic>
      </PointSymbolizer>
    </Rule>
    <Rule>
      <Name>Elektronike</Name>
      <Title>Elektronike</Title>
      <ogc:Filter>
        <ogc:PropertyIsEqualTo>
          <ogc:PropertyName>Kategoria</ogc:PropertyName>
          <ogc:Literal>Elektronike</ogc:Literal>
        </ogc:PropertyIsEqualTo>
      </ogc:Filter>
      <PointSymbolizer>
        <Graphic>
          <Mark>
            <WellKnownName>circle</WellKnownName>
            <Fill><CssParameter name="fill">#f1c40f</CssParameter></Fill>
            <Stroke>
              <CssParameter name="stroke">#2c3e50</CssParameter>
              <CssParameter name="stroke-width">1</CssParameter>
            </Stroke>
          </Mark>
          <Size>12</Size>
        </Graphic>
      </PointSymbolizer>
    </Rule>
    <Rule>
      <Name>Gastronomi</Name>
      <Title>Gastronomi</Title>
      <ogc:Filter>
        <ogc:PropertyIsEqualTo>
          <ogc:PropertyName>Kategoria</ogc:PropertyName>
          <ogc:Literal>Gastronomi</ogc:Literal>
        </ogc:PropertyIsEqualTo>
      </ogc:Filter>
      <PointSymbolizer>
        <Graphic>
          <Mark>
            <WellKnownName>circle</WellKnownName>
            <Fill><CssParameter name="fill">#e67e22</CssParameter></Fill>
            <Stroke>
              <CssParameter name="stroke">#2c3e50</CssParameter>
              <CssParameter name="stroke-width">1</CssParameter>
            </Stroke>
          </Mark>
          <Size>12</Size>
        </Graphic>
      </PointSymbolizer>
    </Rule>
    <Rule>
      <Name>Market</Name>
      <Title>Market</Title>
      <ogc:Filter>
        <ogc:PropertyIsEqualTo>
          <ogc:PropertyName>Kategoria</ogc:PropertyName>
          <ogc:Literal>Market</ogc:Literal>
        </ogc:PropertyIsEqualTo>
      </ogc:Filter>
      <PointSymbolizer>
        <Graphic>
          <Mark>
            <WellKnownName>circle</WellKnownName>
            <Fill><CssParameter name="fill">#a0522d</CssParameter></Fill>
            <Stroke>
              <CssParameter name="stroke">#2c3e50</CssParameter>
              <CssParameter name="stroke-width">1</CssParameter>
            </Stroke>
          </Mark>
          <Size>12</Size>
        </Graphic>
      </PointSymbolizer>
    </Rule>
    <Rule>
      <Name>Mode</Name>
      <Title>Mode</Title>
      <ogc:Filter>
        <ogc:PropertyIsEqualTo>
          <ogc:PropertyName>Kategoria</ogc:PropertyName>
          <ogc:Literal>Mode</ogc:Literal>
        </ogc:PropertyIsEqualTo>
      </ogc:Filter>
      <PointSymbolizer>
        <Graphic>
          <Mark>
            <WellKnownName>circle</WellKnownName>
            <Fill><CssParameter name="fill">#8e44ad</CssParameter></Fill>
            <Stroke>
              <CssParameter name="stroke">#2c3e50</CssParameter>
              <CssParameter name="stroke-width">1</CssParameter>
            </Stroke>
          </Mark>
          <Size>12</Size>
        </Graphic>
      </PointSymbolizer>
    </Rule>
    <Rule>
      <Name>Sherbime</Name>
      <Title>Sherbime</Title>
      <ogc:Filter>
        <ogc:PropertyIsEqualTo>
          <ogc:PropertyName>Kategoria</ogc:PropertyName>
          <ogc:Literal>Sherbime</ogc:Literal>
        </ogc:PropertyIsEqualTo>
      </ogc:Filter>
      <PointSymbolizer>
        <Graphic>
          <Mark>
            <WellKnownName>circle</WellKnownName>
            <Fill><CssParameter name="fill">#27ae60</CssParameter></Fill>
            <Stroke>
              <CssParameter name="stroke">#2c3e50</CssParameter>
              <CssParameter name="stroke-width">1</CssParameter>
            </Stroke>
          </Mark>
          <Size>12</Size>
        </Graphic>
      </PointSymbolizer>
    </Rule>
    <Rule>
      <Name>Amviseri</Name>
      <Title>Amviseri</Title>
      <ogc:Filter>
        <ogc:PropertyIsEqualTo>
          <ogc:PropertyName>Kategoria</ogc:PropertyName>
          <ogc:Literal>Amviseri</ogc:Literal>
        </ogc:PropertyIsEqualTo>
      </ogc:Filter>
      <PointSymbolizer>
        <Graphic>
          <Mark>
            <WellKnownName>circle</WellKnownName>
            <Fill><CssParameter name="fill">#c0392b</CssParameter></Fill>
            <Stroke>
              <CssParameter name="stroke">#2c3e50</CssParameter>
              <CssParameter name="stroke-width">1</CssParameter>
            </Stroke>
          </Mark>
          <Size>12</Size>
        </Graphic>
      </PointSymbolizer>
    </Rule>
    <Rule>
      <Name>Te tjera</Name>
      <Title>Të tjera</Title>
      <ElseFilter/>
      <PointSymbolizer>
        <Graphic>
          <Mark>
            <WellKnownName>circle</WellKnownName>
            <Fill><CssParameter name="fill">#95a5a6</CssParameter></Fill>
            <Stroke>
              <CssParameter name="stroke">#2c3e50</CssParameter>
              <CssParameter name="stroke-width">1</CssParameter>
            </Stroke>
          </Mark>
          <Size>12</Size>
        </Graphic>
      </PointSymbolizer>
    </Rule>
      </FeatureTypeStyle>
    </UserStyle>
  </NamedLayer>
</StyledLayerDescriptor>
