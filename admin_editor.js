window.onload = function() {
	const __ = wp.i18n.__;
	const { data, apiFetch } = wp;
	const { Component, Fragment, compose } = wp.element;
	const { PluginSidebar, PluginSidebarMoreMenuItem } = wp.editPost;
	const { registerPlugin } = wp.plugins;
	const { Icon, Path, SVG, PanelBody, TextControl, TabPanel, SelectControl } = wp.components;
	const { withState } = wp.compose;
	const { withSelect, withDispatch } = wp.data;
	
	const el = wp.element.createElement;
	const post_id = wp.data.select("core/editor").getCurrentPostId();
	
	class nxRadio_Editor extends Component {
		constructor(props) {
			super(props);
			
			this.state = {
				audio: {},
				podcast: {}
			}
			
			apiFetch( { path: '/wp/v2/podcast/' } ).then( 
				( data ) => {
					var episodes = new Array();

					for (var i = 0; i < data.length; i++) {
						var episode = {};
						episode.value = data[i].id;
						episode.label = data[i].title.rendered;
						episodes.push(episode);
					}
					
					this.setState({
						podcast: episodes
					})
					
					return;
				},
				( err ) => {
					this.setState({
						podcast: false
					})
					return;
				}
			);
			
			apiFetch( { path: '/wp/v2/posts/' + post_id } ).then(
				( data ) => {
					this.setState({
						audio: {
							type: data.meta._nxradio_audio_type[0],
							id: data.meta._nxradio_audio_id[0],
							url: data.meta._nxradio_audio_url[0]
						}
					});
					return;
				}
			);
		}
		
		render() {
			console.log(this.state);
			
			if (!this.state.audio.id && this.state.podcast[0]) {
				this.setState(prevState => ({
					audio: {
						...prevState.audio,
						id: this.state.podcast[0].value + ''
					}
				}))
			}
			
			return (
				el( Fragment, {},
					el( PluginSidebarMoreMenuItem, { 
						target: 'nxradio-editor',
						icon: (
							el( Icon, {
								icon: nxradioIcon,
								size: 14
							})
						)
					}, 'NOXU Radio' ),
					el( PluginSidebar, {
						name: 'nxradio-editor',
						title: 'NOXU Radio'
					},
						// Audio
						el( PanelBody, {
							title: __('Audio'),
							className: 'nx_panel',
							initialOpen: true,
						},
							(this.state.podcast ? (
								el( TabPanel, {
									className: 'nx_tabs',
									orientation: 'horizontal',
									tabs: [{
										name: 'id',
										title: __('Select'),
										className: 'nx_tab',
									},
									{
										name: 'url',
										title: __('Manual'),
										className: 'nx_tab',
									}],
									initialTabName: (this.state.audio.type ? this.state.audio.type : 'url'),
									onSelect: (audioType) => {
										this.setState(prevState => ({
											audio: {
												...prevState.audio,
												type: audioType
											}
										}))
									},
									children: (tab) => {
										return (tab.name == 'id' ? (
											el( SelectControl, {
												className: 'nx_tab_input',
												label: 'Select an Episode.',
												value: this.state.audio.id,
												multiple: false,
												options: this.state.podcast,
												onChange: (audioId) => {
													this.setState(prevState => ({
														audio: {
															...prevState.audio,
															id: audioId
														}
													}))
												}
											})
										):(
											el( TextControl, {
												className: 'nx_tab_input',
												label: 'Enter the full URL to the audio file.',
												value: this.state.audio.url,
												onChange: (audioUrl) => {
													this.setState(prevState => ({
														audio: {
															...prevState.audio,
															url: audioUrl
														}
													}))
												}
											})
										))
									}
								})
							) :  (
								el( TextControl, {
									label: "Enter the full URL to the audio file.",
									value: this.state.audio.url,
									onChange: (audioUrl) => {
										this.setState(prevState => ({
											audio: {
												...prevState.audio,
												url: audioUrl
											}
										}))
									}
								})
							)),
						),
						// Links
						el( PanelBody, {
							title: __('Links'),
							className: 'nx_panel',
							initialOpen: false,
						})
					)
				)
			);
		}
	}
	
	const currentPostMeta = withSelect((select) => {
		const { getEditedPostAttribute } = select('core/editor');
		return { meta: getEditedPostAttribute('meta') }
	});
	
	
	registerPlugin( 'nxradio-editor', {
	    icon: (el( Icon, {
				icon: 'admin-post',
				size: 16
			})),
	    render: nxRadio_Editor,
	});
};