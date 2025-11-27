[] Find a better name rather than retail (maybe mall)
[] Move all literal values


e.g
```js
    const viewConfigData: Array<TViewConfig> = [{
        Id: v4(),
        Kind: ViewConfigKind.Floor,
        Code: 'grove_retail_grove-retail-mall', // <project>_retail_<code> => <code> used for marker navigateTo
        Title: 'Grove Retail Mall',
        Subtitle: 'Grove - Grove Beach Views',
        HasGallery: false,
        CdnBaseUrl: projectConfig.grove.CdnBaseUrl
    }];
```

