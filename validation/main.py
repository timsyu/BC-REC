from os import name
import numpy as np
import distribution
import json
import argparse

parser = argparse.ArgumentParser(description='Generate distribution json')
parser.add_argument('--filename', type=str, default='distri.json',
                    help='json file name')
parser.add_argument('--imagename', type=str, default='distri.png',
                    help='image name')
parser.add_argument('--mode', type=str,
                    help='device or plant', required=True)
parser.add_argument('--seed', type=int,
                    help='seed for random')
parser.add_argument('--mean', type=float,
                    help='mean, mu', required=True)
parser.add_argument('--sigma', type=int,
                    help='sigma', required=True)
parser.add_argument('--size', type=int,
                    help='org number', required=True)

def generateOutput(mode, filename, seed, mean, sigma, size, imageName):
    dis = distribution.Distribution()
    dnormal = dis.draw_normal(seed=seed, mu=mean, sigma=sigma, size=size, toInt=True, draw=True, filename=imageName)
    vals, counts = np.unique(dnormal, return_counts=True)
    # np.array to list
    counts = counts.tolist()
    data = []
    count = 0
    if mode == "device" :
        orgCount = 0
        for i in range(len(vals)):
            num = vals[i]
            c = counts[i]
            for j in range(c):
                orgCount += 1
                for k in range(num):
                    count += 1
                    info = {'name': count,'orgId': orgCount}
                    data.append(info)
        print(orgCount)
        print(count)
    elif mode == "plant" :
        plantCount = 0
        for i in range(len(vals)):
            num = counts[i]
            for j in range(num):
                count += 1
                plantCount += counts[i]
                info = {'name': count ,'num': counts[i]}
                data.append(info)
        print(count)
        print(plantCount)
    out = {'data': data, 'count': count}
    # print(out)
    with open(filename, 'w', encoding='utf-8') as f:
        json.dump(out, f, ensure_ascii=False, indent=4)
    print(True)

if __name__ == '__main__':
    args = parser.parse_args()
    print(args.filename)
    if(args.mode == "device" or args.mode == "plant"):
        generateOutput(args.mode, args.filename, args.seed, args.mean, args.sigma, args.size, args.imagename)