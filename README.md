# Fund-O-Mat

_____                _        ___        __  __       _   
|  ___|   _ _ __   __| |      / _ \      |  \/  | __ _| |_
| |_ | | | | '_ \ / _` |_____| | | |_____| |\/| |/ _` | __|
|  _|| |_| | | | | (_| |_____| |_| |_____| |  | | (_| | |_
|_|   \__,_|_| |_|\__,_|      \___/      |_|  |_|\__,_|\__|
                                                Version 1.0

Fund-O-Mat provides a simple and minimalistic way to accept tips via the Bitcoin
Lightning Network on your website and visualize the progress on funding goals.
It is written in PHP and Javascript with the utilization of
[Vue.js](https://vuejs.org/) and is heavily based on the great work of
[dmichael1011](https://github.com/michael1011/lightningtip) and
[robclark56](https://github.com/robclark56/lightningtip-PHP). Without you this
probably wouldn't exist, so thank you.

## Getting started

requirements

    PHP since version 5.6
    MySQL
    cURL
    LND

installation

    1. extract ZIP file into desired location on server
    2. edit config.sample.php and rename to config.php
    3. edit funding goals in inc/en_fundingTargets.json or your respective language
    4. profit ;-)

## Demo

I will build up a nice little demo of the capabilities in the coming days. In
the meantime you can see it in action here:

    [mikroBIOMIK.org](https://mikrobiomik.org/en/support-us)

If you would like to have your Project listed, or for comments or suggestions
you can drop me an email here [fund-o-mat@sonnenstreifen.de](mailto:fund-o-mat@sonnenstreifen.de)

----

## License
Copyright (C) 2019 by it's authors. Some rights reserved. See LICENSE

    This software is released under the MIT license:

    Permission is hereby granted, free of charge, to any person obtaining a copy of
    this software and associated documentation files (the "Software"), to deal in
    the Software without restriction, including without limitation the rights to
    use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
    the Software, and to permit persons to whom the Software is furnished to do so,
    subject to the following conditions:

    The above copyright notice and this permission notice shall be included in all
    copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
    IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
    FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
    COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
    IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
    CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
