/*
 Copyright (c) 2017 Thomas Becker

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights
 to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in all
 copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 SOFTWARE.
 */

var numberOfPermutationsModule = require("../ConsecutiveSequences.js");
var bruteForceModule = require("./BruteForceCheck.js");
var bigInt = require("../3rdParty/BigInteger.js");

var maxNumElementsForPermutationTests = 15;
var maxNumElementsForBruteForceChecks = 11;
var i, j, k;

var algorithmValue;
var algorithmValueCheck;
var sumOfAlgorithmValues;
var checkSum;
var bruteForceValue;

// Begin Main Test Body
//=====================
//

// Test the bottom-up implementation of Jed Yang's algorithm.
//
console.log("\nTesting numberOfPermutationsWithNoConsecutiveSequences...");
console.log("Jed Yang Algorithm/Brute Force");
for(i = 1; i <= maxNumElementsForPermutationTests; ++i)
{
    var numPermutations = numberOfPermutationsModule.numberOfPermutationsWithNoConsecutiveSequences(i);
    bruteForceValue = "too big for brute force";
    if(i <= maxNumElementsForBruteForceChecks)
    {
        bruteForceValue = bruteForceModule.functions.numberOfPermutationsWithNoConsecutiveSequences(i);
        if(bruteForceValue != numPermutations)
        {
            console.log("Brute force check failed:");
        }
    }

    console.log(numPermutations.toString() + "/" + bruteForceValue);
}

console.log("...done\n");

console.log("-----------------------------------\n");

// --------------------------------------------------------------------------------------------------------------------

// Test number of permutations by consecutive pair count.
//
console.log("Testing numberOfPermutationsByLinkCount...");
console.log("First Line: Algorithm, Second Line: Brute Force");
for(i = 1; i <= maxNumElementsForPermutationTests; ++i)
{
    algorithmValue = numberOfPermutationsModule.numberOfPermutationsByConsecutivePairCount(i);
    console.log(algorithmValue.toString());
    if(i <= maxNumElementsForBruteForceChecks)
    {
        bruteForceValue = bruteForceModule.functions.numberOfPermutationsByConsecutivePairCount(i);
        if(!algorithmValue.some(function(
                elem,
                index
            )
            {
                return !elem.eq(bruteForceValue[index]);
            }))
        {
            console.log(bruteForceValue + "\n");
        }
        else
        {
            console.log("brute force check failed!");
        }
    }
    else
    {
        console.log("too big for brute force\n");
    }
}
console.log("...done\n");

console.log("-----------------------------------\n");

// --------------------------------------------------------------------------------------------------------------------

// Test number of permutations that meet an MCS-specification by lengths and counts.
//
console.log("Testing numberOfPermutationsThatMeetAnMcsSpecificationByLengthsAndCounts...");
console.log("\nCalculating the number of permutations with a given number of consecutive pairs by adding\n" +
            "up the number of permutations with the right number of maximal consecutive sequences, then\n" +
            "checking against numberOfPermutationsByConsecutivePairsCount.");
console.log("\n\"x\" means \"check against numberOfPermutationsByConsecutivePairsCount passed.\"\n");
for(i = 1; i <= maxNumElementsForPermutationTests; ++i)
{
    numConsecutivePairsByExactNumberOfConsecutiveSequences(i);
    console.log("")
}
console.log("...done\n");

console.log("-----------------------------------\n");

// --------------------------------------------------------------------------------------------------------------------

// Test number of permutations with maximal consecutive sequences only in a specified length range. This is really
// about testing our core algorithm numberOfPermutationsThatMeetCertainMcsSpecificationsByLengthsAndCounts.
//
console.log("Testing numberOfPermutationsWithMaximalConsecutiveSequencesOnlyInLengthRange...");

console.log("(i, j, k, c) means: there are c permutations of i elements with at least one maximal\n" +
            "consecutive sequence of length >=j and <=k, but none outside of that range.\n");
console.log("\"x\" means \"check against brute force passed.\"\n");

for(i = 2; i <= maxNumElementsForPermutationTests; ++i)
{
    for(j = 2; j <= i; ++j)
    {
        for(k = j; k <= i; ++k)
        {
            algorithmValue =
                numberOfPermutationsModule.numberOfPermutationsWithMaximalConsecutiveSequencesOnlyInLengthRange(i, j,
                    k);

            if(i <= maxNumElementsForBruteForceChecks)
            {
                bruteForceValue =
                    bruteForceModule.functions.numberOfPermutationsWithMaximalConsecutiveSequencesOnlyInLengthRange(i,
                        j, k);

                if(algorithmValue.eq(bruteForceValue))
                {
                    console.log("(" + i + ", " + j + ", " + k + ", " + algorithmValue.toString() + ") x");
                }
                else
                {
                    console.log("(" + i + ", " + j + ", " + k + ", " + algorithmValue.toString() +
                                ") brute force check failed: " + bruteForceValue.toString());
                }
            }
            else
            {
                console.log(
                    "(" + i + ", " + j + ", " + k + ", " + algorithmValue.toString() + ") too big for brute force");
            }
        }
    }
}
console.log("...done\n");

console.log("-----------------------------------\n");

// --------------------------------------------------------------------------------------------------------------------

// Test number of permutations with at least one maximal consecutive sequence, but none of length greater
// than a specified limit.  This is really about testing our core algorithm
// numberOfPermutationsThatMeetCertainMcsSpecificationsByLengthsAndCounts.
//
var numberOfPermutationsWithConsecutiveSequencesOnlyUpToSomeLength = function(
    numElements,
    maxConsecutiveSequenceLength
)
{
    return numberOfPermutationsModule.numberOfPermutationsWithMaximalConsecutiveSequencesOnlyInLengthRange(numElements,
        2, maxConsecutiveSequenceLength);

};

console.log("Testing numberOfPermutationsWithConsecutiveSequencesOnlyUpToSomeLength...");

console.log("(i, j, c) means: there are c permutations of i elements with at least one maximal\n" +
            "consecutive sequence of length <=j but none of length greater than j.\n");
console.log("\"x\" means \"check against brute force passed.\"\n");

for(i = 2; i <= maxNumElementsForPermutationTests; ++i)
{
    for(j = 2; j <= i; ++j)
    {
        var algorithmValue = numberOfPermutationsWithConsecutiveSequencesOnlyUpToSomeLength(i, j);

        if(i <= maxNumElementsForBruteForceChecks)
        {
            bruteForceValue =
                bruteForceModule.functions.numberOfPermutationsWithConsecutiveSequencesOnlyUpToSomeLength(i, j);
            if(algorithmValue.eq(bruteForceValue))
            {
                console.log("(" + i + ", " + j + ", " + algorithmValue.toString() + ") x");
            }
            else
            {
                console.log("(" + i + ", " + j + ", " + algorithmValue.toString() + ") brute force check failed: " +
                            bruteForceValue.toString());
            }
        }
        else
        {
            console.log("(" + i + ", " + j + ", " + algorithmValue.toString() + ") too big for brute force");
        }
    }

}

console.log("...done\n");

console.log("-----------------------------------\n");

// --------------------------------------------------------------------------------------------------------------------

// Test number of permutations with at least one maximal consecutive sequence, but none of length less
// than a specified limit. This is really about testing our core algorithm
// numberOfPermutationsThatMeetCertainMcsSpecificationsByLengthsAndCounts.
//
var numberOfPermutationsWithConsecutiveSequencesOnlyFromSomeLengthUp = function(
    numElements,
    minLengthOfMaximalConsecutiveSequence
)
{
    return numberOfPermutationsModule.numberOfPermutationsWithMaximalConsecutiveSequencesOnlyInLengthRange(numElements,
        minLengthOfMaximalConsecutiveSequence, numElements);

};
console.log("Testing numberOfPermutationsWithConsecutiveSequencesOnlyFromSomeLengthUp...");

console.log("(i, j, c) means: there are c permutations of i elements with at least one maximal\n" +
            "consecutive sequence of length >=j but none of length less than j.\n");
console.log("\"x\" means \"check against brute force passed.\"\n");

for(i = 2; i <= maxNumElementsForPermutationTests; ++i)
{
    for(j = 2; j <= i; ++j)
    {
        algorithmValue = numberOfPermutationsWithConsecutiveSequencesOnlyFromSomeLengthUp(i, j);

        if(i <= maxNumElementsForBruteForceChecks)
        {
            bruteForceValue =
                bruteForceModule.functions.numberOfPermutationsWithConsecutiveSequencesOnlyFromSomeLengthUp(i, j);
            if(algorithmValue.eq(bruteForceValue))
            {
                console.log("(" + i + ", " + j + ", " + algorithmValue.toString() + ") x");
            }
            else
            {
                console.log("(" + i + ", " + j + ", " + algorithmValue.toString() + ") brute force check failed: " +
                            bruteForceValue.toString());
            }
        }
        else
        {
            console.log("(" + i + ", " + j + ", " + algorithmValue.toString() + ") too big for brute force");
        }
    }
}

// --------------------------------------------------------------------------------------------------------------------

// Test number of permutations with a given number of consecutive sequences of a given length.
//
console.log("Testing numberOfPermutationsWithGivenNumberOfConsecutiveSequencesOfLength...");

console.log(
    "(i, j, k, c) means: there are c permutations of i elements with k\n" + "consecutive sequence of length j.\n");
console.log("\"x\" means \"check against brute force passed.\"\n");

for(i = 2; i <= maxNumElementsForPermutationTests; ++i)
{
    for(j = 2; j <= i; ++j)
    {
        sumOfAlgorithmValues = bigInt.zero;
        for(k = 0; k <= i - j + 2; ++k)
        {
            algorithmValue =
                numberOfPermutationsModule.numberOfPermutationsWithGivenNumberOfConsecutiveSequencesOfLength(i, j, k);

            if(k != 0)
            {
                sumOfAlgorithmValues = sumOfAlgorithmValues.plus(algorithmValue);
            }

            if(i <= maxNumElementsForBruteForceChecks)
            {
                bruteForceValue =
                    bruteForceModule.functions.numPermutationsWithGivenNumberOfConsecutiveSequencesOfLength(i, j, k);
                if(algorithmValue.eq(bruteForceValue))
                {
                    console.log("(" + i + ", " + j + ", " + k + ", " + algorithmValue.toString() + ") x");
                }
                else
                {
                    console.log("(" + i + ", " + j + ", " + k + ", " + algorithmValue.toString() +
                                ") brute force check failed: " + bruteForceValue.toString());
                }
            }
            else
            {
                console.log(
                    "(" + i + ", " + j + ", " + k + ", " + algorithmValue.toString() + ") too big for brute force");
            }

            if(k == 0)
            {
                algorithmValueCheck =
                    numberOfPermutationsModule.numberOfPermutationsWithMaximalConsecutiveSequencesOnlyInLengthRange(i,
                        2, j - 1) + numberOfPermutationsModule.numberOfPermutationsWithNoConsecutiveSequences(i);
                if(algorithmValue.eq(algorithmValueCheck))
                {
                    console.log("Double-check passed.");
                }
                else
                {
                    console.log("Double-check failed: " + algorithmValueCheck);
                }
            }
        }

        checkSum = numberOfPermutationsModule.numberOfPermutationsWithAtLeastOneConsecutiveSequenceOfLength(i, j);
        if(checkSum.eq(sumOfAlgorithmValues))
        {
            console.log("Sum check passed.")
        }
        else
        {
            console.log("Sum check failed: " + checkSum);
        }
    }
}

console.log("...done\n");

console.log("-----------------------------------\n");

// --------------------------------------------------------------------------------------------------------------------

// Probability of hearing x songs in a row in shuffle mode from a playlist of n. This is really about testing our
// core algorithm numberOfPermutationsThatMeetCertainMcsSpecificationsByLengthsAndCounts.
//
console.log("Testing probability of hearing x songs in a row...");

console.log(
    "(i, j, p) means: the probability of hearing i consecutive songs from a playlist of j in shuffle mode is p\n");
console.log("\"x\" means \"check against brute force passed.\"\n");

for(j = 2; j <= maxNumElementsForPermutationTests; ++j)
{
    for(i = j; i <= maxNumElementsForPermutationTests; ++i)
    {
        probabilityOfXInARow(i, j);
    }
    console.log("");
}

//
// End Main Test Body
//===================

// Some Functions (Just to keep the main test section a bit cleaner, whatever)
// ===========================================================================

function numConsecutivePairsByExactNumberOfConsecutiveSequences(numElements)
{
    var numPermutations;
    var numPermutationsCheck;

    numPermutations =
        numberOfPermutationsModule.numberOfPermutationsThatMeetAnMcsSpecificationByLengthsAndCounts(numElements, {});
    numPermutationsCheck = numberOfPermutationsModule.numberOfPermutationsByConsecutivePairCount(numElements)[0];
    logResult("0");

    numPermutations =
        numberOfPermutationsModule.numberOfPermutationsThatMeetAnMcsSpecificationByLengthsAndCounts(numElements, {
            "2" : 1
        });
    numPermutationsCheck = numberOfPermutationsModule.numberOfPermutationsByConsecutivePairCount(numElements)[1];
    logResult("1");

    numPermutations =
        numberOfPermutationsModule.numberOfPermutationsThatMeetAnMcsSpecificationByLengthsAndCounts(numElements,
            {"3" : 1})
                                  .plus(
                                      numberOfPermutationsModule.numberOfPermutationsThatMeetAnMcsSpecificationByLengthsAndCounts(
                                          numElements, {"2" : 2}));
    numPermutationsCheck = numberOfPermutationsModule.numberOfPermutationsByConsecutivePairCount(numElements)[2];
    logResult("2");

    numPermutations =
        numberOfPermutationsModule.numberOfPermutationsThatMeetAnMcsSpecificationByLengthsAndCounts(numElements,
            {"4" : 1})
                                  .plus(
                                      numberOfPermutationsModule.numberOfPermutationsThatMeetAnMcsSpecificationByLengthsAndCounts(
                                          numElements, {
                                              "3" : 1,
                                              "2" : 1
                                          }))
                                  .plus(
                                      numberOfPermutationsModule.numberOfPermutationsThatMeetAnMcsSpecificationByLengthsAndCounts(
                                          numElements, {"2" : 3}));
    numPermutationsCheck = numberOfPermutationsModule.numberOfPermutationsByConsecutivePairCount(numElements)[3];
    logResult("3");

    numPermutations =
        numberOfPermutationsModule.numberOfPermutationsThatMeetAnMcsSpecificationByLengthsAndCounts(numElements,
            {"5" : 1})
                                  .plus(
                                      numberOfPermutationsModule.numberOfPermutationsThatMeetAnMcsSpecificationByLengthsAndCounts(
                                          numElements, {
                                              "4" : 1,
                                              "2" : 1
                                          }))
                                  .plus(
                                      numberOfPermutationsModule.numberOfPermutationsThatMeetAnMcsSpecificationByLengthsAndCounts(
                                          numElements, {
                                              "3" : 2
                                          }))
                                  .plus(
                                      numberOfPermutationsModule.numberOfPermutationsThatMeetAnMcsSpecificationByLengthsAndCounts(
                                          numElements, {
                                              "3" : 1,
                                              "2" : 2
                                          }))
                                  .plus(
                                      numberOfPermutationsModule.numberOfPermutationsThatMeetAnMcsSpecificationByLengthsAndCounts(
                                          numElements, {
                                              "2" : 4
                                          }));

    numPermutationsCheck = numberOfPermutationsModule.numberOfPermutationsByConsecutivePairCount(numElements)[4];
    logResult("4");

    numPermutations =
        numberOfPermutationsModule.numberOfPermutationsThatMeetAnMcsSpecificationByLengthsAndCounts(numElements,
            {"6" : 1})
                                  .plus(
                                      numberOfPermutationsModule.numberOfPermutationsThatMeetAnMcsSpecificationByLengthsAndCounts(
                                          numElements, {
                                              "5" : 1,
                                              "2" : 1
                                          }))
                                  .plus(
                                      numberOfPermutationsModule.numberOfPermutationsThatMeetAnMcsSpecificationByLengthsAndCounts(
                                          numElements, {
                                              "4" : 1,
                                              "3" : 1
                                          }))
                                  .plus(
                                      numberOfPermutationsModule.numberOfPermutationsThatMeetAnMcsSpecificationByLengthsAndCounts(
                                          numElements, {
                                              "4" : 1,
                                              "2" : 2
                                          }))
                                  .plus(
                                      numberOfPermutationsModule.numberOfPermutationsThatMeetAnMcsSpecificationByLengthsAndCounts(
                                          numElements, {
                                              "3" : 2,
                                              "2" : 1
                                          }))
                                  .plus(
                                      numberOfPermutationsModule.numberOfPermutationsThatMeetAnMcsSpecificationByLengthsAndCounts(
                                          numElements, {
                                              "3" : 1,
                                              "2" : 3
                                          }))
                                  .plus(
                                      numberOfPermutationsModule.numberOfPermutationsThatMeetAnMcsSpecificationByLengthsAndCounts(
                                          numElements, {
                                              "2" : 5
                                          }));
    numPermutationsCheck = numberOfPermutationsModule.numberOfPermutationsByConsecutivePairCount(numElements)[5];
    logResult("5");

    function logResult(numPermutationsForDisplay)
    {
        if(numPermutationsCheck === undefined)
        {
            numPermutationsCheck = bigInt.zero;
        }

        if(numPermutations.eq(numPermutationsCheck))
        {
            console.log(
                "Total of " + numPermutationsForDisplay + " in " + numElements + " links: " + numPermutations + " x");
        }
        else
        {
            console.log("Total of " + numPermutationsForDisplay + " in  " + numElements + " links failed!");
        }
    }
}

function probabilityOfXInARow(
    numElements,
    x
)
{
    var numPermutations = numberOfPermutationsModule.numberOfPermutations(numElements);

    var numPermutationsWithAtLeastOneMaximalConsecutiveSequenceOfLengthGreaterThanOrEqualToX = //
        numberOfPermutationsModule.numberOfPermutationsWithAtLeastOneMaximalConsecutiveSequenceOfLengthGreaterThanOrEqualTo(
            numElements, x);

    var probability = numPermutationsWithAtLeastOneMaximalConsecutiveSequenceOfLengthGreaterThanOrEqualToX.toJSNumber() /
                      numPermutations.toJSNumber();

    var numPermutationsWithNoConsecutiveSequencesLongerThanXMinusOne = //
        x == 2

            ?

        numberOfPermutationsModule.numberOfPermutationsWithNoConsecutiveSequences(numElements)

            :

        numberOfPermutationsWithConsecutiveSequencesOnlyUpToSomeLength(numElements, x - 1)
            .plus(numberOfPermutationsModule.numberOfPermutationsWithNoConsecutiveSequences(numElements));

    var numPermutationsWithAtLeastOneMaximalConsecutiveSequenceOfLengthGreaterThanOrEqualToXCheck = numPermutations.minus(
        numPermutationsWithNoConsecutiveSequencesLongerThanXMinusOne);
    var probabilityCheck = //
        numPermutationsWithAtLeastOneMaximalConsecutiveSequenceOfLengthGreaterThanOrEqualToXCheck.toJSNumber() /
        numPermutations.toJSNumber();

    if(!numPermutationsWithAtLeastOneMaximalConsecutiveSequenceOfLengthGreaterThanOrEqualToXCheck.eq(
            numPermutationsWithAtLeastOneMaximalConsecutiveSequenceOfLengthGreaterThanOrEqualToX) ||
       probability != probabilityCheck)
    {
        console.log("(" + x + ", " + numElements + ", " + probability + ") double check failed!");
    }
    else
    {
        if(numElements <= maxNumElementsForBruteForceChecks)
        {
            bruteForceValue =
                bruteForceModule.functions.numPermutationsWithAtLeastOneConsecutiveSequenceLongerThan(numElements,
                    x - 1);
            if(numPermutationsWithAtLeastOneMaximalConsecutiveSequenceOfLengthGreaterThanOrEqualToX.eq(bruteForceValue))
            {
                console.log("(" + x + ", " + numElements + ", " + probability + ") x");
            }
            else
            {
                console.log("(" + x + ", " + numElements + ", " + probability + ") brute force check failed!");
            }
        }
        else
        {
            console.log("(" + x + ", " + numElements + ", " + probability + ") too big for brute force");
        }
    }
}
