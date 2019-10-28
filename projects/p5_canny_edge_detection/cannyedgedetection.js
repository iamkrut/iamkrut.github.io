let img; // Declare variable 'img'.

function setup() {
    canvas = createCanvas(412*2, 412*7);
    img_path = 'https://lh4.googleusercontent.com/SDNLFgcN-ZoyGITdJ5Gsb3zull4_qN7T4wNd2cXVRHFbj1gpCOHf5iYb0VGGVAmIlBPSHuCnmTe0lCrPKHvm7MH-AY18SxajMxLEZySjr5VggCXTfjJLfxcvjga3lPj1HQ=s412';
    loadImage(img_path, img => { // Load the image
        // image(img, 0, 0);
        img_gray = gray_scale(img);
        image(img_gray, 0, 0); 
        
        img_gauss = gaussian_filter(img_gray);
        text('Gaussian Filter', img.width + 10, img.height + img.height/2);
        image(img_gauss, 0, img.height);

        [img_sobel, gradient_direction] = sobel_canny_edge_detector(img_gauss);
        text('Sobel Filter', img.width + 10, img.height * 2 + img.height/2);
        image(img_sobel, 0, img.height * 2);

        img_nms = non_max_suppression(img_sobel, gradient_direction);
        text('NMS', img.width + 10, img.height * 3 + img.height/2);
        image(img_nms, 0, img.height * 3);

        [img_weak, img_strong, img_dt, weak_value, strong_value] = double_threshold(img_nms);
        text('Double Threshold Weak', img.width + 10, img.height * 4 + img.height/2);
        image(img_weak, 0, img.height * 4);
        text('Double Threshold Strong', img.width + 10, img.height * 5 + img.height/2);
        image(img_strong, 0, img.height * 5);

        img_ht = hysteresis_tracking(img_dt, weak_value, strong_value);
        text('Edge Tracking by Hysteresis', img.width + 10, img.height * 6 + img.height/2);
        image(img_ht, 0, img.height * 6);

        image(img_ht, img.width, 0); 
    });
}

function hysteresis_tracking(img, weak_value, strong_value){
    
    for (let i = 1; i < img.width - 1; i ++){
        for (let j = 1; j < img.height - 1; j++){

            if (img.get(i,j)[0] == weak_value){
                if ((img.get(i+1, j-1)[0] == strong_value) || 
                            (img.get(i+1, j)[0] == strong_value) || 
                            (img.get(i+1, j+1)[0] == strong_value) ||
                            (img.get(i, j-1)[0] == strong_value) ||
                            (img.get(i, j+1)[0] == strong_value) ||
                            (img.get(i-1, j-1)[0] == strong_value) ||
                            (img.get(i-1, j)[0] == strong_value) ||
                            (img.get(i-1, j+1)[0] == strong_value)){
                    img.get(i, j)[0] = strong_value;
                } else {
                    img.get(i, j)[0] = 0;
                }
            }
        }
    }

    img.updatePixels();
    return img
}

function double_threshold(img, low_ratio=0.02, high_ratio=0.2){

    max_pixel_value = 0;
    for (let i = 0; i < img.width; i ++){
        for (let j = 0; j < img.height; j++){
            if (max_pixel_value < img.get(i, j)[0]) {
                max_pixel_value = img.get(i, j)[0];
            }
        }
    }
    
    print(max_pixel_value);
    high_threshold = floor(max_pixel_value * high_ratio);
    low_threshold = floor(high_threshold * low_ratio);

    print(high_threshold);
    print(low_threshold);
    
    _img_weak = createImage(img.height, img.width); // create new image
    _img_weak.loadPixels(); // load pixels

    _img_strong = createImage(img.height, img.width); // create new image
    _img_strong.loadPixels(); // load pixels

    _img = createImage(img.height, img.width); // create new image
    _img.loadPixels(); // load pixels

    for (let i = 0; i < img.width; i ++){
        for (let j = 0; j < img.height; j++){
            _img_strong.set(i, j, color(0));
            _img_weak.set(i, j, color(0));
            _img.set(i, j, color(0));

            if (img.get(i, j)[0] >= high_threshold){
                _img_strong.set(i, j, color(255));
                _img.set(i, j, color(255));
            }else if (img.get(i, j)[0] >= low_threshold){
                _img_weak.set(i, j, color(25));
                _img.set(i, j, color(25));
            }
        }
    }
    
    _img_weak.updatePixels(); // update pixels
    _img_strong.updatePixels(); // update pixels
    _img.updatePixels();
    return [_img_weak, _img_strong, _img, low_threshold, high_threshold];
}

function non_max_suppression(img, gradient_direction){
    for (let i = 1; i < img.width - 1; i ++){
        for (let j = 1; j < img.height - 1; j++){
            
            angle = gradient_direction[i][j] * 180. / Math.PI;

            q = 255;
            r = 255;
            
            if ((0 <= angle < 22.5) || (157.5 <= angle <= 180)) { // angle 0
                q = img.get(i, j+1)[0];
                r = img.get(i, j-1)[0];
            } else if (22.5 <= angle[i,j] < 67.5) { // angle 45
                q = img.get(i+1, j-1)[0];
                r = img.get(i-1, j+1)[0];
            } else if (67.5 <= angle[i,j] < 112.5){  // angle 90
                q = img.get(i+1, j)[0];
                r = img.get(i-1, j)[0];
            } else if (112.5 <= angle[i,j] < 157.5){ // angle 135
                q = img.get(i-1, j-1)[0];
                r = img.get(i+1, j+1)[0];
            }
            
            if ((img.get(i, j)[0] < q) || (img.get(i, j)[0] < r)){
                img.set(i,j, color(0));
            }
        }
    }

    img.updatePixels(); // update pixels
    return img;
}

function sobel_canny_edge_detector(img){
    _img = createImage(img.height, img.width); // create new image
    _img.loadPixels(); // load pixels

    gradient_direction = Array(_img.height).fill(null).map(()=>Array(_img.width).fill(null));

    sobel_x = [[-1, 0, 1],
               [-2, 0, 2],
               [-1, 0, 1]];

    sobel_y = [[-1, -2, -1],
               [ 0,  0,  0],
               [ 1,  2,  1]];

    for (let i = 1; i < _img.width - 1; i ++){
        for (let j = 1; j < _img.height - 1; j++){
            neighbor_pixels = [[img.get(i-1,j-1)[0], img.get(i,j-1)[0], img.get(i+1,j-1)[0]],
                               [img.get(i-1,j)[0], img.get(i,j)[0], img.get(i+1,j)[0]],
                               [img.get(i-1,j+1)[0], img.get(i,j+1)[0], img.get(i+1,j+1)[0]]];

            Gx = dot(sobel_x, neighbor_pixels, 3, 3);
            Gy = dot(sobel_y, neighbor_pixels, 3, 3);
            G = floor(Math.sqrt(Gx**2 + Gy**2));
            theta = Math.atan2(Gy, Gx);
            
            _img.set(i,j, color(G));
            gradient_direction[i][j] = theta;
        }
    }

    _img.updatePixels(); // update pixels
    return [_img, gradient_direction];
}

function gaussian_filter(img) {
    _img = createImage(img.height, img.width); // create new image
    _img.loadPixels(); // load pixels

    gauss_filter = [[1, 2, 1],
                    [2, 4, 2],
                    [1, 2, 1]];

    for (let i = 1; i < _img.width - 1; i ++){
        for (let j = 1; j < _img.height - 1; j++){
            neighbor_pixels = [[img.get(i-1,j-1)[0], img.get(i,j-1)[0], img.get(i+1,j-1)[0]],
                               [img.get(i-1,j)[0], img.get(i,j)[0], img.get(i+1,j)[0]],
                               [img.get(i-1,j+1)[0], img.get(i,j+1)[0], img.get(i+1,j+1)[0]]];
            _img.set(i,j, color(floor(dot(gauss_filter, neighbor_pixels, 3, 3) / 16)));
        }
    }

    _img.updatePixels(); // update pixels
    return _img;
}

function gray_scale(img){
    _img = createImage(img.height, img.width); // create new image
    _img.loadPixels(); // load pixels

    for (let i = 0; i < _img.width; i ++){ // average rgb to get grayscale value for each pixel
        for (let j = 0; j < _img.height; j++){
            _img.set(i,j, color((img.get(i,j)[0] + img.get(i,j)[1] + img.get(i,j)[2]) / 3));
        }
    }
    
    _img.updatePixels(); // update pixels
    return _img;
}

function dot(A, B, m, n){
    dot_product = 0;
    for (let i = 0; i < m; i++){
        for (let j = 0; j < n; j++){
            dot_product += A[i][j] * B[i][j];
        }
    }
    return dot_product;
}
