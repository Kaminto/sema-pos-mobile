onConnection() {
    this.setState({ animating: true });
    console.log(this.props);
    this.props.navigation.navigate('App');
    Communications.initialize(
        "http://142.93.115.206:3006/",
        "",
        this.user.current.state.propertyText,
        this.password.current.state.propertyText
    );
    try {
        let message = i18n.t('successful-connection');
        console.log('this.user.current.state.propertyText', this.user.current.state.propertyText);
        console.log('this.password.current.state.propertyText', this.password.current.state.propertyText);
        console.log('login');
        Communications.login()
            .then(result => {
                console.log(
                    'Passed - status' +
                    result.status +
                    ' ' +
                    JSON.stringify(result.response)
                );
                console.log(result.status);
                if (result.status === 200) {
                    console.log(result.status);
                    console.log(result.response);

                    if (result.response.data.kiosks.length === 0) {
                        this.setState({ animating: false });
                        //alert('Kiosik Not Assigned'); 
                        Alert.alert(
                            i18n.t('info'),
                            'Kiosik Not Assigned',
                            [{ text: i18n.t('ok'), style: 'cancel' }],
                            { cancelable: true }
                        );
                        return;
                    }

                    this.saveSettings(
                        "http://142.93.115.206:3006/",
                        result.response.token,
                        result.response.data.kiosks[0].name
                    );
                    console.log("Response site name: " + result.response.data.kiosks[0].name);
                    Communications.getSiteId(
                        result.response.token,
                        result.response.data.kiosks[0].name
                    ).then(async siteId => {
                            console.log('siteId', siteId);
                            if (siteId === -1) {
                                message = i18n.t(
                                    'successful-connection-but',
                                    {
                                        what: this.site.current.state
                                            .propertyText,
                                        happened: i18n.t('does-not-exist')
                                    }
                                );
                            } else if (siteId === -2) {
                                message = i18n.t(
                                    'successful-connection-but',
                                    {
                                        what: this.site.current.state
                                            .propertyText,
                                        happened: i18n.t('is-not-active')
                                    }
                                );
                            } else {
                                this.props.authActions.isAuth(true);
                                this.saveSettings(
                                    result.response.data.kiosks[0].name,
                                    result.response.token,
                                    siteId
                                );
                                Communications.setToken(
                                    result.response.token
                                );
                                Communications.setSiteId(siteId);
                                PosStorage.setTokenExpiration();
                                await Synchronization.synchronizeSalesChannels();
                                Synchronization.scheduleSync();

                                let date = new Date();
                                //date.setDate(date.getDate() - 30);
                                date.setDate(date.getDate() - 7);
                                Communications.getReceiptsBySiteIdAndDate(
                                    siteId,
                                    date
                                )
                                    .then(json => {
                                        console.log('ORIGINAL');
                                        console.log(JSON.stringify(json));
                                        console.log('END');

                                        PosStorage.addRemoteReceipts(
                                            json
                                        ).then(saved => {
                                            console.log('SAVED');
                                            console.log(
                                                JSON.stringify(saved)
                                            );
                                            console.log('END');
                                            Events.trigger(
                                                'ReceiptsFetched',
                                                saved
                                            );
                                        });
                                    })
                                    .catch(error => { });
                            }
                            this.setState({ animating: false });
                            Alert.alert(
                                i18n.t('network-connection'),
                                message,
                                [{ text: i18n.t('ok'), style: 'cancel' }],
                                { cancelable: true }
                            );
                            if (siteId !== -1 && siteId !== -2) {
                                this.closeHandler();
                            }
                        })
                        .catch(error => { });
                } else {
                    this.setState({ animating: false });
                    message =
                        result.response.msg +
                        '(Error code: ' +
                        result.status +
                        ')';
                    Alert.alert(
                        i18n.t('network-connection'),
                        message,
                        [{ text: i18n.t('ok'), style: 'cancel' }],
                        { cancelable: true }
                    );
                }
            })
            .catch(result => {
                console.log(
                    'Failed- status ' +
                    result.status +
                    ' ' +
                    result.response.message
                );
                this.setState({ animating: false });
                Alert.alert(
                    i18n.t('network-connection'),
                    result.response.message + '. (' + result.status + ')',
                    [{ text: i18n.t('ok'), style: 'cancel' }],
                    { cancelable: true }
                );
            });
    } catch (error) {
        this.setState({ animating: false });
        console.log(JSON.stringify(error));
    }
}