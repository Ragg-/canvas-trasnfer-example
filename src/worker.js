import loadAsBlob from './utils/load-as-blob'
import StackBlur from 'stackblur-canvas'
// import BlurEffect from './filters/blur'

import blur from './filters/blur'
import highpass from './filters/highpass'
import lowpass from './filters/highpass'
import Filters from 'canvasfilters'

(async () => {
    let canvas
    let ctx
    let srcImage

    const handlers = {
        ['attach-canvas'](props)
        {
            canvas = props.canvas
            ctx = canvas.getContext('2d')
            // console.log(self, canvas, ctx)
            return []
        },
        async preload()
        {
            const imageBlob = await loadAsBlob('../src/images/example.png')
            srcImage = await createImageBitmap(imageBlob)
            return []
        },
        async render()
        {
            const {width, height} = canvas
            ctx.clearRect(0, 0, width, height)
            ctx.drawImage(srcImage, 0, 0)
            const srcImageBuffer = ctx.getImageData(0, 0, width, height)

            const imageBlurred = blur(srcImageBuffer, 10)
            const imageLowPass = blur(highpass(srcImageBuffer, 230), 80)
            const destinate = Filters.screenBlend(
                Filters.multiplyBlend(srcImageBuffer, imageBlurred),
                imageLowPass,
            )

            ctx.putImageData(new ImageData(new Uint8ClampedArray(destinate.data.buffer), destinate.width, destinate.height), 0, 0)
            ctx.commit()
            return []
        }
    }

    self.onmessage = async ({
        data: {action, ...props}
    }) => {
        if (handlers[action]) {
            const data = await handlers[action](props)
            self.postMessage({action: 'resolve', ...data[0]}, data[1])
        }
    }
})()
