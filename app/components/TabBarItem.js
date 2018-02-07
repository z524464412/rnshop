//import liraries
import React, { PureComponent } from 'react'
import { Image } from 'react-native'

// create a component
class TabBarItem extends PureComponent {
    componentDidMount(){
        // console.log(this.props)
    }
    render() {
        let selectedImage = this.props.selectedImage ? this.props.selectedImage : this.props.normalImage
        return (
            <Image
                source={this.props.focused
                    ? selectedImage
                    : this.props.normalImage}
                style={{ tintColor: this.props.tintColor, width: 35, height: 35 }}
            />
        );
    }
}


//make this component available to the app
export default TabBarItem;
