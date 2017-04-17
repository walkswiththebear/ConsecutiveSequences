# !In Progress!
# ConsecutiveSequences
**ConsecutiveSequences.js** is a set of algorithms for counting the permutations that 
have certain configurations of consecutive sequences.

## Overview
Consider a permutation p of the n natural numbers {1, ..., n}, and let k >= 2. A
**consecutive sequence** of length k in the permutation is an occurrence of k consecutive
integers in the permutation, that is, an occurrence of a contiguous subsequence of the
form (i, i+1, ..., i+k-1). A **maximal consecutive sequence** is a consecutive sequence
that is not part of a longer consecutive sequence.
 
ConsecutiveSequences.js contains various algorithms for counting permutations with and 
without certain configurations of consecutive sequences.

## Usage

### Installation

### Algorithms

#### `numberOfPermutations(numElements)`
     
Returns the number of permutations of `numElements`, that is, `numElements!`. This function is provided
here because it is sometimes more efficient to calculate the size of the complement of a set of
permutations that one is interested in than to calculate the size of that set directly. The function

`numberOfPermutationsWithAtLeastOneMaximalConsecutiveSequenceOfLengthGreaterThanOrEqualTo`

below is an example.
    
##### Precondition
 - `numElements` is an integer (i.e., a js integer, a string that parses as a bigInt, or a bigInt), and
`numElements` >= 1.

***

#### `numberOfPermutationsWithNoConsecutiveSequences(numElements)`

Returns the number of permutations of `numElements` elements that have no consecutive sequences.
The result type is bigInt. 

The implementation is based on the 
<a href="https://www.quora.com/What-is-the-probability-that-a-shuffled-music-album-will-have-at-least-two-songs-in-their-original-relative-consecutive-order" target="_blank">recurrence relation given by Jed Yang on Quora</a>. 
Since the recursive formula for calculating the result for n elements refers to the value for 
n&minus;1 and n&minus;2 elements, a straightforward implementation is exponential in n. This 
function implements a bottom-up version that uses constant space and linear time.
    
##### Precondition
 - `numElements` is an integer (i.e., a js integer, a string that parses as a bigInt, or a bigInt), and
`numElements` >= 1.

***

#### `numberOfPermutationsThatMeetAnMcsSpecificationByLengthsAndCounts(numElements, mcsSpecificationByLengthsAndCounts)`

An MCS-specification by lengths and counts is a map that specifies, for each possible length, the
number of maximal consecutive sequences of that length. This function returns the number of
permutations of `numElements` elements that meet a given MCS-specification by lengths and counts.
The result type is bigInt.

The argument `mcsSpecificationByLengthsAndCounts` must be a map (i.e., a js object) whose keys are 
a subset of the set {2, ..., `numElements`}. For each key k, the value of k is interpreted as the 
desired number of maximal consecutive sequences of length k. If the combined length of all requested 
maximal consecutive sequences (i.e., the sum of k * value(k) over all keys k) is less than `numElements`, 
the returned number of permutations will be greater than zero. Otherwise, it will be zero.

If a sequence length does not occur as a key in the map `mcsSpecificationByLengthsAndCounts`, the
number of maximal consecutive sequences of that length is assumed to be zero. However, a zero number of 
maximal consecutive sequences may also be requested explicitly with a zero value.

##### Preconditions:
- `numElements` is an integer (i.e., a js integer, a string that parses as a bigInt, or a bigInt), and
`numElements` >= 1.

- The keys of the map `numMaximalConsecutiveSequencesOfEachLength` are strings that parse as bigInts,
and as integers, they are a subset of the set {2, ..., `numElements`}.

- The values of the map `numMaximalConsecutiveSequencesOfEachLength` are non-negative integers. Here,
"integer" means a js integer, a string that parses as a bigInt, or a bigInt.

***

#### `numberOfPermutationsThatMeetCertainMcsSpecificationsByLengthsAndCounts(numElements, selectionCondition)`

An MCS-specification by lengths and counts is a map (i.e., a js object) that specifies, for each possible length,
the number of maximal consecutive sequences of that length. This function iterates over all MCS-specifications
by lengths and counts for `numElements` and lets a client-supplied selection condition decide which ones to accept
and which ones to reject. The function returns the number of permutations that meet any one of the accepted 
MCS-specifications. The result type is bigInt. See the documentation of the function `getNewSelectionCondition` 
for details on how the client-supplied selection condition needs to be written.

The total number of MCS-specifications by lengths and counts is large: it approximately equals 
`numElements`<sup>`numElements`</sup>` / numElements!`. Therefore, the client-supplied selection
condition offers ways to cut down on the number of MCS-specifications that this function presents for
selection. See the documentation of the function `getNewSelectionCondition` for details.

##### Preconditions:

 - `numElements` is a javascript integer, and `numElements` >= 1.

 - `selectionCondition` is an instance of `SelectionCondition`. (See the documentation of `getNewSelectionCondition`.)

***

#### `getNewSelectionCondition(acceptMcsSpecification, [noMaximalConsecutiveSequencesOfLengthLessThan, noMaximalConsecutiveSequencesOfLengthGreaterThan])`

Factory function for obtaining a new selection condition, to be used with the function
`numberOfPermutationsThatMeetCertainMcsSpecificationsByLengthsAndCounts`. Read the documentation
of that function before reading this documentation.

The function `numberOfPermutationsThatMeetCertainMcsSpecificationsByLengthsAndCounts` presents each possible
MCS-specification by lengths and counts to the selection condition, for a decision whether the permutations
that meet that MCS-specification should be included in the count.

More precisely, if `selectionCondition` is the `SelectionCondition` object obtained from `getNewSelectionCondition`,
the function `numberOfPermutationsThatMeetCertainMcsSpecificationsByLengthsAndCounts` calls

`selectionCondition.acceptMcsSpecification(spec);`

for every MCS-specification by lengths and counts. Here, `spec` is an array whose entry at index i is
the number of maximal consecutive sequences of length i. The elements of the array are bigInts, and
the entries at i=0 and i=1 are always 0. If the client-supplied function `acceptMcsSpecification` 
returns true on such a specification, the permutations that meet that specification will be accepted 
for the count; otherwise, they won't be.

There is one optimization that may allow the client to cut down on the number of MCS-specifications by
lengths and counts that need to be looked at. If you pass an integer `minLength` as the second argument to
`getNewSelectionCondition`, then only those MCS-specifications by lengths and counts will be presented to
your selection condition that specify zero maximal consecutive sequences for every length less than `minLength`.
If you pass an integer `maxLength` as the third argument to `getNewSelectionCondition`, then only those
MCS-specifications by lengths and counts will be presented to your selection condition that specify zero
maximal consecutive sequences for every length greater than `maxLength`. If you want to pass just the third
argument but not the second, pass a falsy value for the second argument. 

 See the functions
 
`numberOfPermutationsWithAtLeastOneMaximalConsecutiveSequenceOfLengthGreaterThanOrEqualTo`

and 

`numberOfPermutationsWithMaximalConsecutiveSequencesOnlyInLengthRange`

below for examples of how to write the `acceptMcsSpecification` function for your selection condition
and how to use the `minLength`/`maxLength` optimization.

##### Preconditions:

 - `noMaximalConsecutiveSequencesOfLengthLessThan` is a js integer, and `noMaximalConsecutiveSequencesOfLengthLessThan` >= 2.

 - `noMaximalConsecutiveSequencesOfLengthGreaterThan` is a js integer, and `noMaximalConsecutiveSequencesOfLengthGreaterThan`
    >= 1.

***

#### `numberOfPermutationsWithMaximalConsecutiveSequencesOnlyInLengthRange(numElements, minLength, maxLength)`

Returns the number of permutations of `numElements` elements that have at least one maximal consecutive
sequence within a specified length range, but none of any length outside that range. The result type is bigInt.

This algorithm is provided mainly as an example of how to use the `minLength`/`maxLength` feature of
the selection condition for the function `numberOfPermutationsThatMeetCertainMcsSpecificationsByLengthsAndCounts`.

##### Preconditions:

 - `numElements` is a js integer, and `numElements` >= 1.

 - `minLength` is a js integer, and `minLength` >= 2.
 
 - `maxLength` is a js integer, and `maxLength` >= `minLength`.

***

#### `numberOfPermutationsWithAtLeastOneMaximalConsecutiveSequenceOfLengthGreaterThanOrEqualTo(numElements, minLength)`

Returns the number of permutations of `numElements` elements that have at least one maximal consecutive
sequence of length greater than or equal to `minLength`. The result type is bigInt.

This algorithm is provided mainly as an example of how to write a selection
condition.  Also, this function demonstrates that it may take a little creativity to 
get the most out of the `minLength`/`maxLength` optimization that the selection condition offers. 
A straightforward implementation of this function would not be able to use that optimization. 
However, if one calculates the number of permutations that do *not* have any maximal consecutive 
sequences of length greater than or equal to the minimum length and then subtracts that from the 
number of all permutations, then the optimization can be applied.

##### Preconditions:

 - `numElements` is a js integer, and `numElements` >= 1.

 - `minLength` is a js integer, and `minLength` >= 2.

***

#### `numberOfPermutationsWithAtLeastOneConsecutiveSequenceOfLength(numElements, length)`

Returns the number of permutations of `numElements` elements that have at least one consecutive
sequence of length equal to `length`. The result type is bigInt.

This algorithm is provided mainly as an example of how to use the algorithms that deal with
the number of permutations with certain configurations of maximal consecutive sequences to 
answer questions about the number of permutations with certain configurations of consecutive 
sequences. In this case, it is as simple as calling the function

`numberOfPermutationsWithAtLeastOneMaximalConsecutiveSequenceOfLengthGreaterThanOrEqualTo`

That's because for a permutation to have a consecutive sequence of some length is equivalent
to having a maximal consecutive sequence greater than or equal to that length.

##### Preconditions:

 - `numElements` is a js integer, and `numElements` >= 1.

 - `length` is a js integer, and `length` >= 2.

***

#### `numberOfPermutationsWithGivenNumberOfConsecutiveSequencesOfLength(numElements, length, count)`

Returns the number of permutations of `numElements` elements that have `count` many consecutive
sequences of length equal to `length`.

This algorithm is provided mainly as an example of how to use the algorithms that deal with
the number of permutations with certain configurations of maximal consecutive sequences to 
answer questions about the number of permutations with certain configurations of consecutive 
sequences.

##### Preconditions:

 - `numElements` is a js integer, and `numElements` >= 1.

 - `length` is a js integer, and `length` >= 2.

 - `count` is a js integer, and `count` >= 0.

***

#### `numberOfPermutationsByConsecutivePairCount(numElements)`

Returns an array of length `numElements` such that the entry at index i is the
number of permutations with i consecutive pairs. The array elements are of type bigInt.

NOTE: This algorithm is provided here more or less as a curiosity. It employs a logic
that seems to work only for consecutive pairs, but not for consecutive sequences of
greater length. It is used in the regression tests for this package as a means of
double-checking the results of other algorithms.

##### Precondition

- `numElements` is a js integer and `numElements` >= 1.
