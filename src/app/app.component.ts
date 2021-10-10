import { Component } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {environment} from "../environments/environment";

interface ImageAccessInformation {
  index: string
  url: string
}

interface ImageDictionary {
  [index: string]: string[]
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'stack-image-app'
  file: File | null = null
  index = 0
  rawImageList: ImageDictionary = {}
  permutedImageList: string[][] = []
  generatedImages: string = ''

  constructor(private httpClient: HttpClient) {
  }

  onFileSelected(event: Event) {
    const hasFile = event
      && event.target instanceof HTMLInputElement
      && (event.target as HTMLInputElement).files

    if (hasFile) {
      this.file = ((event.target as HTMLInputElement).files as FileList)[0];
    }

  }

  onAddButtonClicked(event: Event) {
    if (this.file) {
      const fd = new FormData()
      fd.append('data', this.file)
      fd.append('index', String(this.index))

      this.httpClient.post(environment.API_IMAGES_RESOURCE, fd).subscribe(this.handleUploadCompleteCb)
    }
  }

  onIndexChange(event: Event) {
    const newIndex = (event.target as HTMLSelectElement).value

    this.index = Number(newIndex)
  }

  private handleUploadCompleteCb = () => {
    this.httpClient.get<ImageAccessInformation[]>(environment.API_IMAGES_RESOURCE).subscribe(this.handleGetCompleteCb)
  }

  private handleGetCompleteCb = (getResult: ImageAccessInformation[]) => {
    const imageDictionary = this.generateImageDictionary(getResult)

    this.rawImageList = imageDictionary

    const toPermute = this.generateCartesianInput(getResult)
    const permutedList = this.cartesian.apply(null, toPermute as any) as string[][]
    this.permutedImageList = permutedList

    console.log(permutedList)
    //TODO: Map list to their own layers
    this.generatedImages = 'Image mapping and div stacking has not been implemented yet! Please see console for generated combinations.'
  }

  private generateCartesianInput(getResult: ImageAccessInformation[]): Array<string[]> {
    const maxIndex = getResult.reduce((prev, current) => {
      const currentIndex = Number(current.index)
      return (prev > currentIndex) ? prev : currentIndex
      }, 0) - 1

    return getResult.reduce<Array<string[]>>((
      accumulatedImages: Array<string[]>,
      currentImage: ImageAccessInformation,
    ) => {
      const currentImageIndex = Number(currentImage.index)
      const newAccumulatedImages = accumulatedImages[currentImageIndex]
        ? [...accumulatedImages[currentImageIndex], currentImage.url]
        : [currentImage.url]

      accumulatedImages[currentImageIndex] = newAccumulatedImages
      return accumulatedImages
    }, new Array<string[]>(maxIndex).fill([], 0, maxIndex))
  }

  private generateImageDictionary(getResult: ImageAccessInformation[]): ImageDictionary {
    return getResult.reduce((
      accumulatedImages: ImageDictionary,
      currentImage: ImageAccessInformation
    ) => {
      const currentImageIndex = Number(currentImage.index)
      const pushCondition = currentImageIndex >= 0 && currentImageIndex < 3
      if (pushCondition) {
        const currentImagesOnIndex = accumulatedImages[currentImageIndex]
        const newImages =
          currentImagesOnIndex ?
            [...currentImagesOnIndex, currentImage.url]:
            [currentImage.url]

        accumulatedImages[currentImageIndex] = newImages
      }
      return accumulatedImages
    }, {})
  }

  private mappedProductOf = (a: unknown[], b: unknown[]) => {
    const answer = ([] as unknown[][]).concat(...a.map(memberOfA => b.map(memberOfB => ([] as unknown[]).concat(memberOfA, memberOfB))))

    return answer
  }

  // Main cartesian function: Makes use of spread operators to recursively merge and accumulate cartesian product.
  // Opted for maps instead of reduce to boost efficiency
  private cartesian = (a: unknown[], b?:unknown[], ...c: unknown[][]): unknown[] => {
    return b ? this.cartesian(this.mappedProductOf(a,b), ...c): a
  }
}
